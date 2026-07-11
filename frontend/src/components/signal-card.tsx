"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SignalStatusBadge } from "@/components/signal-status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Signal } from "@/lib/types";

export function SignalCard({ signal, index = 0 }: { signal: Signal; index?: number }) {
  const isBuy = signal.direction === "BUY";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Card className="h-full transition-transform hover:-translate-y-1 hover:border-gold-500/30">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Signal #{signal.signalNumber}
            </span>
            <SignalStatusBadge status={signal.status} />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  isBuy ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                }`}
              >
                {isBuy ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
              </span>
              <div>
                <p className="font-display text-lg font-bold">{signal.pair}</p>
                <p className={`text-xs font-semibold ${isBuy ? "text-success" : "text-danger"}`}>
                  {signal.direction}
                </p>
              </div>
            </div>
            {signal.vipOnly && (
              <Badge variant="default">
                <Lock className="h-3 w-3" /> VIP
              </Badge>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-white/[0.03] p-2.5">
              <p className="text-xs text-foreground/40">Entry</p>
              <p className="font-semibold">{signal.entryPrice}</p>
            </div>
            <div className="rounded-lg bg-white/[0.03] p-2.5">
              <p className="text-xs text-foreground/40">Stop Loss</p>
              <p className="font-semibold text-danger">{signal.stopLoss}</p>
            </div>
            <div className="rounded-lg bg-white/[0.03] p-2.5">
              <p className="text-xs text-foreground/40">TP1</p>
              <p className="font-semibold text-success">{signal.takeProfit1}</p>
            </div>
            <div className="rounded-lg bg-white/[0.03] p-2.5">
              <p className="text-xs text-foreground/40">Risk</p>
              <p className="font-semibold">{signal.riskPercent ? `${signal.riskPercent}%` : "—"}</p>
            </div>
          </div>

          {signal.notes && <p className="mt-4 line-clamp-2 text-sm text-foreground/50">{signal.notes}</p>}

          <p className="mt-4 text-xs text-foreground/30">{formatDate(signal.createdAt)}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
