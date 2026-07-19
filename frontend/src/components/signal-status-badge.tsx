import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/context/i18n-context";
import type { SignalStatus } from "@/lib/types";

const VARIANT_MAP: Record<SignalStatus, "success" | "danger" | "warning" | "neutral" | "default"> = {
  PENDING: "neutral",
  RUNNING: "warning",
  HIT_TP1: "success",
  HIT_TP2: "success",
  HIT_TP3: "success",
  STOPPED_OUT: "danger",
  CLOSED: "neutral",
  CANCELLED: "neutral",
};

export function SignalStatusBadge({ status }: { status: SignalStatus }) {
  const { dict } = useI18n();
  const LABEL_MAP: Record<SignalStatus, string> = {
    PENDING: dict.signalStatus.pending,
    RUNNING: dict.signalStatus.running,
    HIT_TP1: dict.signalStatus.hitTp1,
    HIT_TP2: dict.signalStatus.hitTp2,
    HIT_TP3: dict.signalStatus.hitTp3,
    STOPPED_OUT: dict.signalStatus.stoppedOut,
    CLOSED: dict.signalStatus.closed,
    CANCELLED: dict.signalStatus.cancelled,
  };
  const variant = VARIANT_MAP[status] || "neutral";
  const label = LABEL_MAP[status] || dict.signalStatus.pending;
  return <Badge variant={variant}>{label}</Badge>;
}
