import { Router } from "express";
import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import slugify from "@/utils/slugify";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, optionalAuth, AuthRequest } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { logAudit } from "@/utils/audit";

const router = Router();

router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { timeframe, type, pair } = req.query as Record<string, string>;
    const where: any = { published: true };
    if (timeframe) where.timeframe = timeframe;
    if (type) where.type = type;
    if (pair) where.pair = pair;

    const isVip = req.user?.role === "VIP" || req.user?.role === "ADMIN";
    if (!isVip) where.vipOnly = false;

    const analysis = await prisma.marketAnalysis.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json({ analysis });
  })
);

router.get(
  "/:slug",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const analysis = await prisma.marketAnalysis.findUnique({ where: { slug: req.params.slug } });
    if (!analysis || !analysis.published) {
      res.status(404).json({ message: "Analysis not found" });
      return;
    }
    const isVip = req.user?.role === "VIP" || req.user?.role === "ADMIN";
    if (analysis.vipOnly && !isVip) {
      const { body, videoUrl, chartImageUrl, ...preview } = analysis;
      res.json({ analysis: preview, locked: true });
      return;
    }
    res.json({ analysis, locked: false });
  })
);

router.get(
  "/admin/all",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const analysis = await prisma.marketAnalysis.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ analysis });
  })
);

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  [body("title").notEmpty(), body("timeframe").isIn(["DAILY", "WEEKLY", "MONTHLY"]), body("type").isIn(["TECHNICAL", "FUNDAMENTAL"])],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { title, summary, body: contentBody, timeframe, type, pair, chartImageUrl, videoUrl, vipOnly, published, scheduledFor } = req.body;
    const slug = `${slugify(title)}-${Date.now().toString(36)}`;

    const analysis = await prisma.marketAnalysis.create({
      data: { title, slug, summary, body: contentBody, timeframe, type, pair: pair || "XAUUSD", chartImageUrl, videoUrl, vipOnly: !!vipOnly, published: published !== false, scheduledFor: scheduledFor ? new Date(scheduledFor) : null },
    });
    await logAudit(req.user!.id, "CREATE_MARKET_ANALYSIS", "MarketAnalysis", analysis.id);
    res.status(201).json({ analysis });
  })
);

router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const analysis = await prisma.marketAnalysis.update({ where: { id: req.params.id }, data: req.body });
    await logAudit(req.user!.id, "UPDATE_MARKET_ANALYSIS", "MarketAnalysis", analysis.id);
    res.json({ analysis });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.marketAnalysis.delete({ where: { id: req.params.id } });
    await logAudit(req.user!.id, "DELETE_MARKET_ANALYSIS", "MarketAnalysis", req.params.id);
    res.json({ message: "Analysis deleted" });
  })
);

export default router;
