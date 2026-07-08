import React from "react";
import { Theme } from "../../types";

export function DetailSection({
  title,
  children,
  T,
}: {
  title: string;
  children: React.ReactNode;
  T: Theme;
}) {
  return (
    <div>
      <p
        className="text-xs font-semibold mb-2.5 tracking-wide uppercase"
        style={{ color: T.inkFaint, fontFamily: "'Inter', sans-serif" }}
      >
        {title}
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">{children}</div>
    </div>
  );
}

export function DetailRow({
  label,
  value,
  T,
}: {
  label: string;
  value: string;
  T: Theme;
}) {
  return (
    <div
      className="flex justify-between items-baseline text-sm py-1.5"
      style={{ borderBottom: `1px solid ${T.cardBorder}` }}
    >
      <span
        style={{ color: T.inkDim, fontFamily: "'Inter', sans-serif" }}
      >
        {label}
      </span>
      <span
        className="font-medium"
        style={{ color: T.ink, fontFamily: "'Inter', sans-serif" }}
      >
        {value}
      </span>
    </div>
  );
}
