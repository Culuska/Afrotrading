import { Router } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "@/middleware/auth";
import { logAudit } from "@/utils/audit";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    res.json({ settings: settings || {} });
  })
);

router.put(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...req.body },
      update: req.body,
    });
    await logAudit(req.user!.id, "UPDATE_SETTINGS", "SiteSettings", "singleton");
    res.json({ settings });
  })
);

export default router;
