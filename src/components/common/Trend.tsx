import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Theme } from "../../types";

export function Trend({
  value,
  T,
  invert,
}: {
  value: number;
  T: Theme;
  invert?: boolean;
}) {
  const isUp = value > 0;
  const isFlat = value === 0;
  const Icon = isFlat ? Minus : isUp ? ArrowUpRight : ArrowDownRight;
  const goodDirection = invert ? !isUp : isUp;
  const color = isFlat ? T.inkFaint : goodDirection ? T.error : T.success;

  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-medium"
      style={{ color, fontFamily: "'Inter', sans-serif" }}
    >
      <Icon size={12} strokeWidth={2.5} />
      {isFlat ? "0%" : `${Math.abs(value)}%`}
    </span>
  );
}
