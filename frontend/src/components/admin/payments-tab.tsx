"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Bitcoin, Smartphone } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import type { Payment } from "@/lib/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

const STATUS_VARIANT: Record<Payment["status"], "success" | "warning" | "neutral" | "danger"> = {
  CONFIRMED: "success",
  PENDING: "warning",
  FAILED: "danger",
  EXPIRED: "neutral",
  REJECTED: "danger",
};

export function AdminPaymentsTab() {
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: () => api.get<{ payments: Payment[] }>("/api/payments/admin/all"),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/payments/admin/${id}/approve`),
    onSuccess: () => {
      toast.success("Payment approved, membership activated");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to approve"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/api/payments/admin/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success("Payment rejected");
      setRejectingId(null);
      invalidate();
    },
  });

  if (isLoading) {
    return <p className="py-8 text-center text-foreground/50">Loading payments...</p>;
  }

  if (!data?.payments.length) {
    return <p className="py-8 text-center text-foreground/50">No payments yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.payments.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <p className="font-medium">{p.user?.fullName}</p>
              <p className="text-xs text-foreground/40">{p.user?.email}</p>
            </TableCell>
            <TableCell className="text-xs">{p.plan.replace("_", " ")}</TableCell>
            <TableCell>
              <span className="flex items-center gap-1.5 text-xs">
                {p.provider === "CRYPTO" ? <Bitcoin className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                {p.provider === "CRYPTO" ? p.payCurrency || "Crypto" : "EVC/Zaad"}
              </span>
            </TableCell>
            <TableCell>${Number(p.amountUsd).toFixed(0)}</TableCell>
            <TableCell className="max-w-[140px] truncate text-xs text-foreground/60">
              {p.transactionRef || p.nowPaymentsId || "—"}
              {p.proofImageUrl && (
                <>
                  {" "}
                  <a href={p.proofImageUrl} target="_blank" rel="noopener noreferrer" className="text-gold-400 underline">
                    proof
                  </a>
                </>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
            </TableCell>
            <TableCell className="whitespace-nowrap text-xs text-foreground/50">{formatDate(p.createdAt)}</TableCell>
            <TableCell className="text-right">
              {p.provider === "MOBILE_MONEY" && p.status === "PENDING" && (
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => approveMutation.mutate(p.id)}>
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </Button>
                  {rejectingId === p.id ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => rejectMutation.mutate({ id: p.id, reason: "Could not verify transaction" })}
                    >
                      <XCircle className="h-4 w-4 text-danger" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => setRejectingId(p.id)}>
                      <XCircle className="h-4 w-4 text-foreground/40" />
                    </Button>
                  )}
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
