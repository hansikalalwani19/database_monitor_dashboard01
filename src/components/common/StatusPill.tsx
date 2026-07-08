import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Theme, STATUS, StatusType } from "../../types";

const statusConfig = {
  [STATUS.HEALTHY]: {
    Icon: CheckCircle2,
  },
  [STATUS.WARNING]: {
    Icon: AlertTriangle,
  },
  [STATUS.OFFLINE]: {
    Icon: XCircle,
  },
};

const statusColors: Record<StatusType, { color: string; bg: string }> = {
  [STATUS.HEALTHY]: { color: "#3E6B45", bg: "rgba(76,122,82,0.14)" },
  [STATUS.WARNING]: { color: "#A5652C", bg: "rgba(185,119,62,0.16)" },
  [STATUS.OFFLINE]: { color: "#A23B27", bg: "rgba(180,70,47,0.14)" },
};

export function StatusPill({ status, T }: { status: StatusType; T: Theme }) {
  const config = statusConfig[status];
  const colors = statusColors[status];
  const Icon = config.Icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        background: colors.bg,
        color: colors.color,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Icon size={12} strokeWidth={2.5} />
      {status}
      {status === STATUS.OFFLINE && (
        <span
          className="w-1.5 h-1.5 rounded-full db-mnode"
          style={{ background: colors.color }}
        />
      )}
    </span>
  );
}
