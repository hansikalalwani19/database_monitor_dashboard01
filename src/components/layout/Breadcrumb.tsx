import React from "react";
import { ChevronRight } from "lucide-react";
import { Theme } from "../../types";

export function Breadcrumb({
  trail,
  T,
  onJump,
}: {
  trail: string[];
  T: Theme;
  onJump: (index: number) => void;
}) {
  return (
    <div
      className="flex items-center gap-1.5 text-xs mb-2 flex-wrap"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {trail.map((t, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <ChevronRight size={12} style={{ color: T.bgInkFaint }} />
          )}
          <button
            onClick={() => i < trail.length - 1 && onJump(i)}
            className="transition-colors"
            style={{
              color: i === trail.length - 1 ? T.bgInk : T.bgInkFaint,
              fontWeight: i === trail.length - 1 ? 600 : 400,
              cursor: i < trail.length - 1 ? "pointer" : "default",
            }}
          >
            {t}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
