import { Router } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "@/middleware/auth";
import { logAudit } from "@/utils/audit";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const plans = await prisma.pricingPlan.findMany({ where: { isActive: true }, orderBy: { order: "asc" } });
    res.json({ plans });
  })
);

router.get(
  "/admin/all",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const plans = await prisma.pricingPlan.findMany({ orderBy: { order: "asc" } });
    res.json({ plans });
  })
);

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const plan = await prisma.pricingPlan.create({ data: req.body });
    await logAudit(req.user!.id, "CREATE_PRICING_PLAN", "PricingPlan", plan.id);
    res.status(201).json({ plan });
  })
);

router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const plan = await prisma.pricingPlan.update({ where: { id: req.params.id }, data: req.body });
    await logAudit(req.user!.id, "UPDATE_PRICING_PLAN", "PricingPlan", plan.id);
    res.json({ plan });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.pricingPlan.delete({ where: { id: req.params.id } });
    await logAudit(req.user!.id, "DELETE_PRICING_PLAN", "PricingPlan", req.params.id);
    res.json({ message: "Plan deleted" });
  })
);

export default router;
