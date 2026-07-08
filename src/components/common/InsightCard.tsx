import { LucideIcon } from "lucide-react";
import { Theme } from "../../types";

export function InsightCard({
  icon: Icon,
  label,
  value,
  T,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  T: Theme;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-3"
      style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${accent}1C` }}
      >
        <Icon size={16} style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p
          className="text-xs"
          style={{ color: T.inkFaint, fontFamily: "'Inter', sans-serif" }}
        >
          {label}
        </p>
        <p
          className="text-sm font-semibold truncate"
          style={{ color: T.ink, fontFamily: "'Inter', sans-serif" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
