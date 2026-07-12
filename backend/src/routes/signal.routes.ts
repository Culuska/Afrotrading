import { Router } from "express";
import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import { SignalStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, optionalAuth, AuthRequest } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { logAudit } from "@/utils/audit";
import { sendTelegramMessage, editTelegramMessage, formatSignalMessage } from "@/utils/telegram";

const router = Router();

const WINNING_STATUSES: SignalStatus[] = ["HIT_TP1", "HIT_TP2", "HIT_TP3"];
const LOSING_STATUSES: SignalStatus[] = ["STOPPED_OUT"];

/** Prisma's Decimal fields reject empty strings; blank optional numeric inputs must become null. */
function toDecimalOrNull(value: unknown): string | number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return value as string | number;
}

// ---------- Public / user-facing ----------

router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { filter, search, pair, page = "1", limit = "20" } = req.query as Record<string, string>;

    const where: any = { isPublished: true, isArchived: false };

    if (filter === "winning") where.status = { in: WINNING_STATUSES };
    else if (filter === "losing") where.status = { in: LOSING_STATUSES };
    else if (filter === "running") where.status = "RUNNING";
    else if (filter === "pending") where.status = "PENDING";

    if (pair) where.pair = pair;
    if (search) {
      where.OR = [
        { pair: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const isVip = req.user?.role === "VIP" || req.user?.role === "ADMIN";
    if (!isVip) where.vipOnly = false;

    const take = Math.min(Number(limit) || 20, 100);
    const skip = (Number(page) - 1) * take;

    const [signals, total] = await Promise.all([
      prisma.signal.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
      prisma.signal.count({ where }),
    ]);

    res.json({ signals, total, page: Number(page), limit: take });
  })
);

router.get(
  "/history",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { range = "monthly", pair } = req.query as Record<string, string>;

    const now = new Date();
    const since = new Date(now);
    if (range === "weekly") since.setDate(now.getDate() - 7);
    else if (range === "yearly") since.setFullYear(now.getFullYear() - 1);
    else since.setMonth(now.getMonth() - 1);

    const where: any = {
      isPublished: true,
      status: { in: [...WINNING_STATUSES, ...LOSING_STATUSES, "CLOSED"] },
      createdAt: { gte: since },
    };
    if (pair) where.pair = pair;

    const isVip = req.user?.role === "VIP" || req.user?.role === "ADMIN";
    if (!isVip) where.vipOnly = false;

    const signals = await prisma.signal.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json({ signals, range });
  })
);

router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const signal = await prisma.signal.findUnique({ where: { id: req.params.id } });
    if (!signal || !signal.isPublished) {
      res.status(404).json({ message: "Signal not found" });
      return;
    }
    res.json({ signal });
  })
);

// ---------- Admin management ----------

router.get(
  "/admin/all",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { status, page = "1", limit = "30" } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status;

    const take = Math.min(Number(limit) || 30, 200);
    const skip = (Number(page) - 1) * take;

    const [signals, total] = await Promise.all([
      prisma.signal.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
      prisma.signal.count({ where }),
    ]);
    res.json({ signals, total, page: Number(page), limit: take });
  })
);

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  [
    body("direction").isIn(["BUY", "SELL"]),
    body("entryPrice").isNumeric(),
    body("stopLoss").isNumeric(),
    body("takeProfit1").isNumeric(),
  ],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const {
      pair, direction, entryPrice, stopLoss, takeProfit1, takeProfit2, takeProfit3,
      riskPercent, notes, chartImageUrl, vipOnly, isPublished, scheduledFor,
    } = req.body;

    const signal = await prisma.signal.create({
      data: {
        pair: pair || "XAUUSD",
        direction,
        entryPrice,
        stopLoss,
        takeProfit1,
        takeProfit2: toDecimalOrNull(takeProfit2),
        takeProfit3: toDecimalOrNull(takeProfit3),
        riskPercent: toDecimalOrNull(riskPercent),
        notes: notes || null,
        chartImageUrl: chartImageUrl || null,
        vipOnly: !!vipOnly,
        isPublished: !!isPublished,
        publishedAt: isPublished ? new Date() : null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: "PENDING",
      },
    });

    await logAudit(req.user!.id, "CREATE_SIGNAL", "Signal", signal.id, { pair: signal.pair, direction });

    if (signal.isPublished) {
      const sent = await sendTelegramMessage(formatSignalMessage(signal));
      const messageId = sent?.result?.message_id;
      if (messageId) await prisma.signal.update({ where: { id: signal.id }, data: { telegramSent: true, telegramMessageId: messageId } });
    }

    res.status(201).json({ signal });
  })
);

router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const existing = await prisma.signal.findUnique({ where: { id: req.params.id } });
    const wasPublished = existing?.isPublished;

    const {
      pair, direction, entryPrice, stopLoss, takeProfit1, takeProfit2, takeProfit3,
      riskPercent, notes, chartImageUrl, vipOnly, isPublished, scheduledFor,
    } = req.body;

    const signal = await prisma.signal.update({
      where: { id: req.params.id },
      data: {
        pair, direction, entryPrice, stopLoss, takeProfit1,
        takeProfit2: toDecimalOrNull(takeProfit2),
        takeProfit3: toDecimalOrNull(takeProfit3),
        riskPercent: toDecimalOrNull(riskPercent),
        notes: notes || null,
        chartImageUrl: chartImageUrl || null,
        vipOnly,
        isPublished,
        publishedAt: isPublished && !wasPublished ? new Date() : undefined,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      },
    });

    await logAudit(req.user!.id, "UPDATE_SIGNAL", "Signal", signal.id);

    if (isPublished && !wasPublished && !signal.telegramSent) {
      const sent = await sendTelegramMessage(formatSignalMessage(signal));
      const messageId = sent?.result?.message_id;
      if (messageId) await prisma.signal.update({ where: { id: signal.id }, data: { telegramSent: true, telegramMessageId: messageId } });
    } else if (isPublished && wasPublished && signal.telegramSent && signal.telegramMessageId) {
      // Signal was already posted to Telegram; keep that message in sync with the edit instead of leaving it stale.
      await editTelegramMessage(formatSignalMessage(signal), signal.telegramMessageId);
    }

    res.json({ signal });
  })
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN"),
  [body("status").isIn(["PENDING", "RUNNING", "HIT_TP1", "HIT_TP2", "HIT_TP3", "STOPPED_OUT", "CLOSED", "CANCELLED"])],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { status, resultPips, profitUsd, riskReward } = req.body;
    const isTerminal = ["HIT_TP3", "STOPPED_OUT", "CLOSED", "CANCELLED"].includes(status);

    const signal = await prisma.signal.update({
      where: { id: req.params.id },
      data: {
        status,
        resultPips: toDecimalOrNull(resultPips),
        profitUsd: toDecimalOrNull(profitUsd),
        riskReward: toDecimalOrNull(riskReward),
        closedAt: isTerminal ? new Date() : undefined,
      },
    });

    await logAudit(req.user!.id, "UPDATE_SIGNAL_STATUS", "Signal", signal.id, { status });
    res.json({ signal });
  })
);

router.post(
  "/:id/duplicate",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const original = await prisma.signal.findUnique({ where: { id: req.params.id } });
    if (!original) {
      res.status(404).json({ message: "Signal not found" });
      return;
    }
    const { id, signalNumber, createdAt, updatedAt, ...rest } = original;
    const duplicate = await prisma.signal.create({
      data: { ...rest, isPublished: false, telegramSent: false, status: "PENDING", closedAt: null, publishedAt: null },
    });
    await logAudit(req.user!.id, "DUPLICATE_SIGNAL", "Signal", duplicate.id, { originalId: id });
    res.status(201).json({ signal: duplicate });
  })
);

router.patch(
  "/:id/archive",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const signal = await prisma.signal.update({ where: { id: req.params.id }, data: { isArchived: true } });
    await logAudit(req.user!.id, "ARCHIVE_SIGNAL", "Signal", signal.id);
    res.json({ signal });
  })
);

router.patch(
  "/:id/publish",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const signal = await prisma.signal.update({
      where: { id: req.params.id },
      data: { isPublished: true, publishedAt: new Date() },
    });
    await logAudit(req.user!.id, "PUBLISH_SIGNAL", "Signal", signal.id);

    if (!signal.telegramSent) {
      const sent = await sendTelegramMessage(formatSignalMessage(signal));
      const messageId = sent?.result?.message_id;
      if (messageId) await prisma.signal.update({ where: { id: signal.id }, data: { telegramSent: true, telegramMessageId: messageId } });
    }
    res.json({ signal });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.signal.delete({ where: { id: req.params.id } });
    await logAudit(req.user!.id, "DELETE_SIGNAL", "Signal", req.params.id);
    res.json({ message: "Signal deleted" });
  })
);

export default router;
