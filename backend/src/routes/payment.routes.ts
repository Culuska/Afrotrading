import { Router } from "express";
import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import { MembershipPlan } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { logAudit } from "@/utils/audit";
import { createInvoice, verifyIpnSignature } from "@/utils/nowpayments";
import { sendEmail, membershipChangedEmailTemplate } from "@/utils/email";

const router = Router();

const PLAN_PRICES: Record<Exclude<MembershipPlan, "FREE">, number> = {
  VIP_MONTHLY: 49,
  VIP_LIFETIME: 399,
};

/** Applies a confirmed payment: upgrades the user's membership and notifies them. */
async function activateMembership(payment: { userId: string; plan: MembershipPlan }) {
  const expiresAt =
    payment.plan === "VIP_MONTHLY" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;

  const user = await prisma.user.update({
    where: { id: payment.userId },
    data: { membership: payment.plan, role: "VIP", membershipExpiresAt: expiresAt },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      channel: "EMAIL",
      title: "Payment confirmed",
      body: `Your payment was confirmed and your membership is now ${payment.plan.replace("_", " ")}.`,
    },
  });

  const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;
  void sendEmail(
    user.email,
    "Your AfroTrading membership is active",
    membershipChangedEmailTemplate(user.fullName, payment.plan, dashboardUrl)
  );
}

// ---------- Crypto (NowPayments) ----------

router.post(
  "/crypto/create",
  requireAuth,
  [body("plan").isIn(["VIP_MONTHLY", "VIP_LIFETIME"])],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const plan = req.body.plan as "VIP_MONTHLY" | "VIP_LIFETIME";
    const amountUsd = PLAN_PRICES[plan];

    const payment = await prisma.payment.create({
      data: { userId: req.user!.id, provider: "CRYPTO", plan, amountUsd, status: "PENDING" },
    });

    const invoice = await createInvoice({
      priceAmount: amountUsd,
      orderId: payment.id,
      orderDescription: `AfroTrading ${plan.replace("_", " ")} membership`,
      successUrl: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      cancelUrl: `${process.env.FRONTEND_URL}/pricing?payment=cancelled`,
    });

    if (!invoice) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
      res.status(502).json({ message: "Could not start crypto checkout. Please try again shortly." });
      return;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { nowPaymentsId: invoice.id, invoiceUrl: invoice.invoice_url },
    });

    res.status(201).json({ invoiceUrl: invoice.invoice_url });
  })
);

router.post(
  "/nowpayments/webhook",
  asyncHandler(async (req, res) => {
    const signature = req.headers["x-nowpayments-sig"] as string | undefined;
    if (!verifyIpnSignature(req.body, signature)) {
      res.status(401).json({ message: "Invalid signature" });
      return;
    }

    const { order_id, payment_status, pay_currency } = req.body as {
      order_id: string;
      payment_status: string;
      pay_currency?: string;
    };

    const payment = await prisma.payment.findUnique({ where: { id: order_id } });
    if (!payment || payment.status === "CONFIRMED") {
      res.json({ received: true });
      return;
    }

    if (["finished", "confirmed"].includes(payment_status)) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "CONFIRMED", payCurrency: pay_currency },
      });
      await activateMembership(payment);
    } else if (["failed", "expired"].includes(payment_status)) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: payment_status === "expired" ? "EXPIRED" : "FAILED" },
      });
    }

    res.json({ received: true });
  })
);

// ---------- Manual mobile money (EVC Plus / Zaad) ----------

router.post(
  "/manual/submit",
  requireAuth,
  [
    body("plan").isIn(["VIP_MONTHLY", "VIP_LIFETIME"]),
    body("mobileNumber").notEmpty(),
    body("transactionRef").notEmpty(),
  ],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { plan, mobileNumber, transactionRef, proofImageUrl } = req.body;
    const amountUsd = PLAN_PRICES[plan as "VIP_MONTHLY" | "VIP_LIFETIME"];

    const payment = await prisma.payment.create({
      data: {
        userId: req.user!.id,
        provider: "MOBILE_MONEY",
        plan,
        amountUsd,
        mobileNumber,
        transactionRef,
        proofImageUrl: proofImageUrl || null,
        status: "PENDING",
      },
    });

    res.status(201).json({
      message: "Payment submitted for review. We'll confirm your membership once verified.",
      payment,
    });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ payments });
  })
);

// ---------- Admin ----------

router.get(
  "/admin/all",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { fullName: true, email: true } } },
    });
    res.json({ payments });
  })
);

router.patch(
  "/admin/:id/approve",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: { status: "CONFIRMED", reviewedById: req.user!.id, reviewedAt: new Date() },
    });
    await activateMembership(payment);
    await logAudit(req.user!.id, "APPROVE_PAYMENT", "Payment", payment.id);
    res.json({ payment });
  })
);

router.patch(
  "/admin/:id/reject",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: {
        status: "REJECTED",
        reviewedById: req.user!.id,
        reviewedAt: new Date(),
        rejectionReason: req.body.reason || null,
      },
    });
    await logAudit(req.user!.id, "REJECT_PAYMENT", "Payment", payment.id);
    res.json({ payment });
  })
);

export default router;
