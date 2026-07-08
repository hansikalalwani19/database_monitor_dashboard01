import React from "react";
import { Theme } from "../../types";

export function RecommendationPanel({
  T,
  items,
  accent,
}: {
  T: Theme;
  items: string[];
  accent: string;
}) {
  return (
    <div
      className="rounded-xl p-4 sm:p-5"
      style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}
    >
      <p
        className="text-sm font-semibold mb-3"
        style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}
      >
        Recommendations
      </p>
      <div className="flex flex-col gap-2.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-2.5 text-sm">
            <div
              className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
              style={{ background: accent }}
            />
            <span
              style={{ color: T.inkDim, fontFamily: "'Inter', sans-serif" }}
            >
              {it}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
