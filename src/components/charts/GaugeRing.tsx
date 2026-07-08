import { useState, useEffect } from "react";
import { Theme } from "../../types";

export function GaugeRing({
  value,
  T,
  color,
  size = 148,
  label,
}: {
  value: number;
  T: Theme;
  color: string;
  size?: number;
  label: string;
}) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 60);
    return () => clearTimeout(t);
  }, [value]);

  const offset = c - (Math.min(100, animated) / 100) * c;

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ width: size, height: size, margin: "0 auto" }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={T.surfaceMute}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </svg>
      <div style={{ marginTop: -size / 2 - 8 }} className="flex flex-col items-center">
        <span
          className="text-2xl font-semibold"
          style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}
        >
          {value}%
        </span>
        <span
          className="text-[11px]"
          style={{ color: T.inkFaint, fontFamily: "'Inter', sans-serif" }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
