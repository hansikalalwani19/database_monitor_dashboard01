import React from "react";
import { Search, X } from "lucide-react";
import { Theme } from "../../types";
import { Dropdown } from "../common";

interface FilterChip {
  label: string;
  onRemove: () => void;
}

interface FilterConfig {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}

export function FilterBar({
  T,
  search,
  onSearch,
  filters = [],
  activeChips = [],
  onClearAll,
}: {
  T: Theme;
  search: string;
  onSearch: (v: string) => void;
  filters?: FilterConfig[];
  activeChips?: FilterChip[];
  onClearAll: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: T.inkFaint }}
          />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none transition-shadow duration-150"
            style={{
              background: T.card,
              border: `1px solid ${T.cardBorder}`,
              color: T.ink,
              fontFamily: "'Inter', sans-serif",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.boxShadow = `0 0 0 3px ${T.primary}22`)
            }
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
        </div>
        {filters.map((f) => (
          <Dropdown key={f.label} {...f} T={T} />
        ))}
      </div>
      {activeChips.length > 0 && (
        <div
          className="flex items-center gap-2 flex-wrap"
          style={{ animation: "rowIn 0.2s ease-out" }}
        >
          <span
            className="text-xs"
            style={{ color: T.inkFaint, fontFamily: "'Inter', sans-serif" }}
          >
            Active filters:
          </span>
          {activeChips.map((c, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
              style={{
                background: T.primaryBg,
                color: T.primary,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {c.label}
              <X
                size={11}
                className="cursor-pointer"
                onClick={c.onRemove}
              />
            </span>
          ))}
          <button
            onClick={onClearAll}
            className="text-xs font-medium"
            style={{ color: T.inkDim, fontFamily: "'Inter', sans-serif" }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
