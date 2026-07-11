import { Badge } from "@/components/ui/badge";
import type { SignalStatus } from "@/lib/types";

const STATUS_MAP: Record<SignalStatus, { label: string; variant: "success" | "danger" | "warning" | "neutral" | "default" }> = {
  PENDING: { label: "Pending", variant: "neutral" },
  RUNNING: { label: "Running", variant: "warning" },
  HIT_TP1: { label: "Hit TP1", variant: "success" },
  HIT_TP2: { label: "Hit TP2", variant: "success" },
  HIT_TP3: { label: "Hit TP3", variant: "success" },
  STOPPED_OUT: { label: "Stopped Out", variant: "danger" },
  CLOSED: { label: "Closed", variant: "neutral" },
  CANCELLED: { label: "Cancelled", variant: "neutral" },
};

export function SignalStatusBadge({ status }: { status: SignalStatus }) {
  const config = STATUS_MAP[status] || STATUS_MAP.PENDING;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
