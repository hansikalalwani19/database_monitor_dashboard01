import React from "react";
import { LucideIcon } from "lucide-react";
import { Theme } from "../../types";
import { useTilt, useCountUp } from "../../hooks";
import { Trend } from "./Trend";
import { MiniSparkline } from "./MiniSparkline";
import { SparklinePoint } from "../../types";

export function KPICard({
  icon: Icon,
  label,
  value,
  accent,
  sub,
  trend,
  spark,
  T,
  delay = 0,
  ready,
  invert,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  accent: string;
  sub?: string;
  trend?: number;
  spark?: SparklinePoint[];
  T: Theme;
  delay?: number;
  ready: boolean;
  invert?: boolean;
  onClick?: () => void;
}) {
  const tilt = useTilt(4);
  const numeric = typeof value === "number";
  const shown = numeric ? useCountUp(value as number, ready) : value;

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMove}
      onMouseLeave={tilt.onLeave}
      onClick={onClick}
      className="relative rounded-xl p-4 flex flex-col gap-2.5 min-w-0 overflow-hidden"
      style={{
        background: T.card,
        border: `1px solid ${T.cardBorder}`,
        boxShadow: "0 1px 2px rgba(20,30,20,0.08)",
        opacity: ready ? 1 : 0,
        transform: ready ? "translateY(0)" : "translateY(6px)",
        transition: `opacity 0.45s ease ${delay}ms, transform 0.15s ease-out`,
        cursor: onClick ? "pointer" : "default",
        ...tilt.style,
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${accent}1C` }}
        >
          <Icon size={15} style={{ color: accent }} strokeWidth={2.2} />
        </div>
        {trend !== undefined && <Trend value={trend} T={T} invert={invert} />}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p
            className="text-2xl font-semibold leading-none mb-1.5"
            style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}
          >
            {numeric
              ? (shown as number).toLocaleString()
              : (shown as string)}
          </p>
          <p
            className="text-xs"
            style={{ color: T.inkDim, fontFamily: "'Inter', sans-serif" }}
          >
            {label}
          </p>
          {sub && (
            <p
              className="text-[11px] mt-0.5"
              style={{ color: T.inkFaint, fontFamily: "'Inter', sans-serif" }}
            >
              {sub}
            </p>
          )}
        </div>
        {spark && <MiniSparkline data={spark} color={accent} />}
      </div>
    </div>
  );
}
