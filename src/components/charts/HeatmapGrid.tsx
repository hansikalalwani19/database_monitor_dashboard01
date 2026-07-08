import React from "react";
import { Theme } from "../../types";

export function HeatmapGrid({
  rows,
  cols,
  cell,
  T,
  accent,
}: {
  rows: string[];
  cols: string[];
  cell: (rowIdx: number, colIdx: number) => number;
  T: Theme;
  accent: string;
}) {
  return (
    <div className="overflow-x-auto">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `70px repeat(${cols.length}, minmax(22px, 1fr))`,
          gap: 3,
        }}
      >
        <div />
        {cols.map((c, i) => (
          <div
            key={i}
            className="text-center text-[9px]"
            style={{ color: T.inkFaint, fontFamily: "'Inter', sans-serif" }}
          >
            {c}
          </div>
        ))}
        {rows.map((r, ri) => (
          <React.Fragment key={ri}>
            <div
              className="text-[11px] pr-2 flex items-center justify-end truncate"
              style={{ color: T.inkDim, fontFamily: "'Inter', sans-serif" }}
            >
              {r}
            </div>
            {cols.map((_, ci) => {
              const v = cell(ri, ci);
              return (
                <div
                  key={ci}
                  title={`${v}%`}
                  className="rounded"
                  style={{
                    height: 20,
                    background: `${accent}${Math.round(20 + (v / 100) * 200)
                      .toString(16)
                      .padStart(2, "0")}`,
                  }}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
