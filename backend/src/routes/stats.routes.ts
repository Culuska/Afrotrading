import { Router } from "express";
import asyncHandler from "express-async-handler";
import { SignalStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const router = Router();

const WINNING_STATUSES: SignalStatus[] = ["HIT_TP1", "HIT_TP2", "HIT_TP3"];
const LOSING_STATUSES: SignalStatus[] = ["STOPPED_OUT"];

router.get(
  "/performance",
  asyncHandler(async (_req, res) => {
    const [total, winning, losing, running, pending, closed] = await Promise.all([
      prisma.signal.count({ where: { isPublished: true } }),
      prisma.signal.count({ where: { isPublished: true, status: { in: WINNING_STATUSES } } }),
      prisma.signal.count({ where: { isPublished: true, status: { in: LOSING_STATUSES } } }),
      prisma.signal.count({ where: { isPublished: true, status: "RUNNING" } }),
      prisma.signal.count({ where: { isPublished: true, status: "PENDING" } }),
      prisma.signal.findMany({
        where: { isPublished: true, status: { in: [...WINNING_STATUSES, ...LOSING_STATUSES] } },
        select: { status: true, profitUsd: true, riskReward: true, resultPips: true, closedAt: true, createdAt: true },
      }),
    ]);

    const decided = winning + losing;
    const winRate = decided > 0 ? Number(((winning / decided) * 100).toFixed(2)) : 0;

    const grossProfit = closed
      .filter((s) => Number(s.profitUsd || 0) > 0)
      .reduce((sum, s) => sum + Number(s.profitUsd || 0), 0);
    const grossLoss = Math.abs(
      closed.filter((s) => Number(s.profitUsd || 0) < 0).reduce((sum, s) => sum + Number(s.profitUsd || 0), 0)
    );
    const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? grossProfit : 0;

    const avgRR =
      closed.length > 0
        ? Number((closed.reduce((sum, s) => sum + Number(s.riskReward || 0), 0) / closed.length).toFixed(2))
        : 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const monthlyProfit = closed
      .filter((s) => s.closedAt && s.closedAt >= startOfMonth)
      .reduce((sum, s) => sum + Number(s.profitUsd || 0), 0);
    const weeklyProfit = closed
      .filter((s) => s.closedAt && s.closedAt >= startOfWeek)
      .reduce((sum, s) => sum + Number(s.profitUsd || 0), 0);

    const sorted = [...closed].sort((a, b) => Number(b.profitUsd || 0) - Number(a.profitUsd || 0));
    const bestTrade = sorted[0] || null;
    const worstTrade = sorted[sorted.length - 1] || null;

    res.json({
      totalSignals: total,
      winningSignals: winning,
      losingSignals: losing,
      runningSignals: running,
      pendingSignals: pending,
      winRate,
      profitFactor,
      averageRiskReward: avgRR,
      monthlyProfit: Number(monthlyProfit.toFixed(2)),
      weeklyProfit: Number(weeklyProfit.toFixed(2)),
      bestTrade,
      worstTrade,
    });
  })
);

export default router;
