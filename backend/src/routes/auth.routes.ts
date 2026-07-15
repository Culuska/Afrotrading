import { Router } from "express";
import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { signToken } from "@/utils/jwt";
import { validate } from "@/middleware/validate";
import { authLimiter } from "@/middleware/rateLimit";
import { requireAuth, AuthRequest } from "@/middleware/auth";
import { sendEmail, verificationEmailTemplate, passwordResetEmailTemplate } from "@/utils/email";
import { REFERRAL_REWARD_DAYS } from "@/utils/referral";

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

router.post(
  "/register",
  authLimiter,
  [
    body("fullName").trim().isLength({ min: 2 }).withMessage("Full name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("country").optional().trim(),
    body("phone").optional().trim(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { fullName, email, password, country, phone, referralCode } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "An account with this email already exists" });
      return;
    }

    let referredById: string | undefined;
    let referrer: Awaited<ReturnType<typeof prisma.user.findUnique>> = null;
    if (referralCode) {
      referrer = await prisma.user.findUnique({ where: { referralCode } });
      if (referrer) referredById = referrer.id;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        country,
        passwordHash,
        emailVerifyToken,
        referredById,
      },
    });

    if (referrer && referrer.membership !== "VIP_LIFETIME") {
      const base =
        referrer.membershipExpiresAt && referrer.membershipExpiresAt > new Date()
          ? referrer.membershipExpiresAt
          : new Date();
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          membership: referrer.membership === "FREE" ? "VIP_MONTHLY" : referrer.membership,
          membershipExpiresAt: new Date(base.getTime() + REFERRAL_REWARD_DAYS * 24 * 60 * 60 * 1000),
        },
      });
    }

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerifyToken}`;
    void sendEmail(email, "Verify your AfroTrading account", verificationEmailTemplate(fullName, verifyUrl));

    const token = signToken({ userId: user.id, role: user.role });
    res.cookie("token", token, COOKIE_OPTIONS);

    const { passwordHash: _ph, emailVerifyToken: _evt, passwordResetToken: _prt, twoFactorSecret: _tfs, ...safeUser } = user;
    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
      token,
      user: safeUser,
      telegramGroupUrl: process.env.TELEGRAM_GROUP_URL,
    });
  })
);

router.post(
  "/login",
  authLimiter,
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password, rememberMe } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    if (user.status === "SUSPENDED") {
      res.status(403).json({ message: "Your account has been suspended. Contact support." });
      return;
    }

    const token = signToken({ userId: user.id, role: user.role });
    res.cookie("token", token, {
      ...COOKIE_OPTIONS,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });

    const { passwordHash, emailVerifyToken, passwordResetToken, twoFactorSecret, ...safeUser } = user;
    res.json({ token, user: safeUser });
  })
);

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const { passwordHash, emailVerifyToken, passwordResetToken, twoFactorSecret, ...safeUser } = user;
    res.json({ user: safeUser });
  })
);

router.get(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      res.status(400).json({ message: "Invalid verification token" });
      return;
    }
    const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (!user) {
      res.status(400).json({ message: "Invalid or expired verification token" });
      return;
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null, status: "ACTIVE" },
    });
    res.json({ message: "Email verified successfully" });
  })
);

router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail().normalizeEmail()],
  validate,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      void sendEmail(email, "Reset your AfroTrading password", passwordResetEmailTemplate(user.fullName, resetUrl));
    }

    res.json({ message: "If that email exists, a reset link has been sent." });
  })
);

router.post(
  "/reset-password",
  authLimiter,
  [body("token").notEmpty(), body("password").isLength({ min: 8 })],
  validate,
  asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { passwordResetToken: token, passwordResetExpires: { gt: new Date() } },
    });
    if (!user) {
      res.status(400).json({ message: "Invalid or expired reset token" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpires: null },
    });
    res.json({ message: "Password reset successfully. You can now log in." });
  })
);

router.post(
  "/change-password",
  requireAuth,
  [body("currentPassword").notEmpty(), body("newPassword").isLength({ min: 8 })],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const valid = await bcrypt.compare(req.body.currentPassword, user.passwordHash);
    if (!valid) {
      res.status(400).json({ message: "Current password is incorrect" });
      return;
    }
    const passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    res.json({ message: "Password updated successfully" });
  })
);

export default router;
