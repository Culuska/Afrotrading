import { Router } from "express";
import asyncHandler from "express-async-handler";
import { body, query } from "express-validator";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { logAudit } from "@/utils/audit";

const router = Router();

// ---------- Self-service profile ----------

router.patch(
  "/me",
  requireAuth,
  [body("fullName").optional().trim(), body("phone").optional().trim(), body("country").optional().trim()],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { fullName, phone, country, notifyEmail, notifyTelegram, notifyPush } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { fullName, phone, country, notifyEmail, notifyTelegram, notifyPush },
    });
    const { passwordHash, ...safe } = user;
    res.json({ user: safe });
  })
);

router.get(
  "/me/saved-signals",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const saved = await prisma.savedSignal.findMany({
      where: { userId: req.user!.id },
      include: { signal: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ savedSignals: saved });
  })
);

router.post(
  "/me/saved-signals/:signalId",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const saved = await prisma.savedSignal.upsert({
      where: { userId_signalId: { userId: req.user!.id, signalId: req.params.signalId } },
      create: { userId: req.user!.id, signalId: req.params.signalId },
      update: {},
    });
    res.status(201).json({ saved });
  })
);

router.delete(
  "/me/saved-signals/:signalId",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.savedSignal.deleteMany({
      where: { userId: req.user!.id, signalId: req.params.signalId },
    });
    res.json({ message: "Removed from saved signals" });
  })
);

router.get(
  "/me/education-progress",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const progress = await prisma.educationProgress.findMany({
      where: { userId: req.user!.id },
      include: { content: true },
    });
    res.json({ progress });
  })
);

router.put(
  "/me/education-progress/:contentId",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { completed, progressPct } = req.body;
    const progress = await prisma.educationProgress.upsert({
      where: { userId_contentId: { userId: req.user!.id, contentId: req.params.contentId } },
      create: { userId: req.user!.id, contentId: req.params.contentId, completed, progressPct },
      update: { completed, progressPct },
    });
    res.json({ progress });
  })
);

router.get(
  "/me/notifications",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ notifications });
  })
);

router.patch(
  "/me/notifications/:id/read",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { read: true },
    });
    res.json({ message: "Marked as read" });
  })
);

router.post(
  "/me/telegram-link",
  requireAuth,
  [body("telegramChatId").notEmpty(), body("telegramUsername").optional()],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        telegramChatId: req.body.telegramChatId,
        telegramUsername: req.body.telegramUsername,
        telegramJoined: true,
      },
    });
    const { passwordHash, ...safe } = user;
    res.json({ user: safe });
  })
);

// ---------- Admin: user management ----------

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  [query("search").optional(), query("role").optional(), query("status").optional()],
  validate,
  asyncHandler(async (req, res) => {
    const { search, role, status, page = "1", limit = "20" } = req.query as Record<string, string>;

    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const take = Math.min(Number(limit) || 20, 100);
    const skip = (Number(page) - 1) * take;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          country: true,
          role: true,
          membership: true,
          status: true,
          telegramJoined: true,
          emailVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: Number(page), limit: take });
  })
);

router.get(
  "/export",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      select: { fullName: true, email: true, phone: true, country: true, role: true, membership: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    const header = "Full Name,Email,Phone,Country,Role,Membership,Status,Created At\n";
    const rows = users
      .map((u) => [u.fullName, u.email, u.phone || "", u.country || "", u.role, u.membership, u.status, u.createdAt.toISOString()].join(","))
      .join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=afrotrading-users.csv");
    res.send(header + rows);
  })
);

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  [body("fullName").notEmpty(), body("email").isEmail(), body("password").isLength({ min: 8 })],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { fullName, email, password, role, membership, country, phone } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        role: role || "FREE",
        membership: membership || "FREE",
        country,
        phone,
        status: "ACTIVE",
        emailVerified: true,
      },
    });
    await logAudit(req.user!.id, "CREATE_USER", "User", user.id, { email });
    const { passwordHash: _, ...safe } = user;
    res.status(201).json({ user: safe });
  })
);

router.patch(
  "/:id/suspend",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { status: "SUSPENDED" } });
    await logAudit(req.user!.id, "SUSPEND_USER", "User", user.id);
    res.json({ message: "User suspended" });
  })
);

router.patch(
  "/:id/activate",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: "ACTIVE", emailVerified: true, emailVerifyToken: null },
    });
    await logAudit(req.user!.id, "ACTIVATE_USER", "User", user.id);
    res.json({ message: "User activated" });
  })
);

router.patch(
  "/:id/membership",
  requireAuth,
  requireRole("ADMIN"),
  [body("membership").isIn(["FREE", "VIP_MONTHLY", "VIP_LIFETIME"])],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { membership, expiresAt } = req.body;
    const role = membership === "FREE" ? "FREE" : "VIP";
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        membership,
        role,
        membershipExpiresAt: expiresAt ? new Date(expiresAt) : membership === "VIP_LIFETIME" ? null : undefined,
      },
    });
    await logAudit(req.user!.id, "CHANGE_MEMBERSHIP", "User", user.id, { membership });
    res.json({ message: "Membership updated", user: { id: user.id, membership: user.membership, role: user.role } });
  })
);

router.post(
  "/:id/reset-password",
  requireAuth,
  requireRole("ADMIN"),
  [body("newPassword").isLength({ min: 8 })],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash } });
    await logAudit(req.user!.id, "RESET_USER_PASSWORD", "User", req.params.id);
    res.json({ message: "Password reset" });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.user.delete({ where: { id: req.params.id } });
    await logAudit(req.user!.id, "DELETE_USER", "User", req.params.id);
    res.json({ message: "User deleted" });
  })
);

export default router;
