import React, { useState, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Theme } from "../../types";
import { useClickOutside } from "../../hooks";

export function Dropdown({
  label,
  value,
  options,
  onChange,
  T,
  width = 150,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  T: Theme;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm justify-between transition-colors"
        style={{
          minWidth: width,
          background: T.card,
          border: `1px solid ${open ? T.primary : T.cardBorder}`,
          color: T.ink,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <span>{value === "All" ? label : value}</span>
        <ChevronDown
          size={14}
          style={{
            color: T.inkFaint,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.18s ease",
          }}
        />
      </button>
      <div
        className="absolute mt-1.5 w-full rounded-lg overflow-hidden z-20 origin-top"
        style={{
          background: T.card,
          border: `1px solid ${T.cardBorder}`,
          boxShadow: "0 8px 24px rgba(20,30,20,0.16)",
          opacity: open ? 1 : 0,
          transform: open
            ? "scale(1) translateY(0)"
            : "scale(0.96) translateY(-4px)",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.14s ease, transform 0.14s ease",
        }}
      >
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => {
              onChange(opt);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors"
            style={{
              color: T.ink,
              fontFamily: "'Inter', sans-serif",
              background: opt === value ? T.surfaceMute : "transparent",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.surfaceMute)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                opt === value ? T.surfaceMute : "transparent")
            }
          >
            {opt === "All" ? `All ${label.toLowerCase()}` : opt}
            {opt === value && <Check size={13} style={{ color: T.primary }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
