import { Theme } from "../../types";

export function MetricBar({
  value,
  color,
  T,
}: {
  value: number;
  color: string;
  T: Theme;
}) {
  return (
    <div
      className="w-20 h-1.5 rounded-full overflow-hidden"
      style={{ background: T.surfaceMute }}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${Math.min(100, value)}%`,
          background: color,
        }}
      />
    </div>
  );
}
