import React from "react";
import { Theme } from "../../types";

export function ChartCard({
  title,
  subtitle,
  T,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  T: Theme;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4 sm:p-5 flex flex-col gap-3"
      style={{
        background: T.card,
        border: `1px solid ${T.cardBorder}`,
        boxShadow: "0 1px 2px rgba(20,30,20,0.06)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}
          >
            {title}
          </p>
          {subtitle && (
            <p
              className="text-xs mt-0.5"
              style={{ color: T.inkFaint, fontFamily: "'Inter', sans-serif" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
