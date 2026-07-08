import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { Theme, DataColumn } from "../../types";
import { exportCSV } from "../../utils/chart";
import { EmptyState, ErrorState } from "../common";

const PAGE_SIZE = 8;

function SkeletonRows({
  T,
  cols = 6,
  count = 6,
}: {
  T: Theme;
  cols?: number;
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="px-4 py-3.5">
              <div
                className="h-3 rounded"
                style={{
                  width: j === 0 ? "80%" : "60%",
                  backgroundImage: `linear-gradient(90deg, ${T.surfaceMute} 25%, ${T.cardBorder} 50%, ${T.surfaceMute} 75%)`,
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.6s ease-in-out infinite",
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  T,
  onRowClick,
  phase = "ready",
  emptyTitle,
  emptySub,
  onClear,
  filename = "export.csv",
  searchable = true,
  search,
  onSearch,
}: {
  columns: DataColumn[];
  rows: T[];
  T: Theme;
  onRowClick?: (row: T) => void;
  phase?: "loading" | "ready" | "error";
  emptyTitle?: string;
  emptySub?: string;
  onClear?: () => void;
  filename?: string;
  searchable?: boolean;
  search?: string;
  onSearch?: (v: string) => void;
}) {
  const [sortKey, setSortKey] = useState(columns[0]?.key);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (typeof av === "string") {
        av = av.toLowerCase();
        bv = (bv ?? "").toLowerCase();
      }
      if (av instanceof Date) {
        av = av.getTime();
        bv = (bv as Date).getTime();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [rows.length, search]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: T.card,
        border: `1px solid ${T.cardBorder}`,
        boxShadow: "0 1px 2px rgba(20,30,20,0.08)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 flex-wrap gap-2"
        style={{ borderBottom: `1px solid ${T.cardBorder}` }}
      >
        {searchable ? (
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: T.inkFaint }}
            />
            <input
              value={search}
              onChange={(e) => onSearch?.(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none"
              style={{
                background: T.surfaceMute,
                color: T.ink,
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
        ) : (
          <span />
        )}
        <button
          onClick={() => exportCSV(sorted, columns, filename)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-transform duration-150 hover:-translate-y-0.5"
          style={{
            background: T.primaryBg,
            color: T.primary,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <Download size={12} /> Export CSV
        </button>
      </div>

      {phase === "error" ? (
        <ErrorState T={T} />
      ) : phase === "ready" && sorted.length === 0 ? (
        <EmptyState
          T={T}
          title={emptyTitle}
          sub={emptySub}
          onClear={onClear}
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: T.surfaceMute }}>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => phase === "ready" && toggleSort(col.key)}
                      className="text-left px-4 py-2.5 font-semibold select-none whitespace-nowrap cursor-pointer"
                      style={{
                        color: T.inkDim,
                        fontFamily: "'Inter', sans-serif",
                        borderBottom: `1px solid ${T.cardBorder}`,
                        fontSize: 11.5,
                      }}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {sortKey === col.key &&
                          (sortDir === "asc" ? (
                            <ChevronUp size={11} />
                          ) : (
                            <ChevronDown size={11} />
                          ))}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {phase === "loading" ? (
                  <SkeletonRows T={T} cols={columns.length} />
                ) : (
                  pageRows.map((r, idx) => (
                    <tr
                      key={(r.id as string) ?? idx}
                      onClick={() => onRowClick?.(r)}
                      className="transition-colors duration-100"
                      style={{
                        borderBottom: `1px solid ${T.cardBorder}`,
                        cursor: onRowClick ? "pointer" : "default",
                        animation: `rowIn 0.25s ease-out ${idx * 25}ms both`,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = T.surfaceMute)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className="px-4 py-3 whitespace-nowrap"
                          style={{
                            color: T.ink,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 12.5,
                          }}
                        >
                          {col.render
                            ? col.render(r)
                            : String(r[col.key] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div
            className="flex items-center justify-between px-4 py-3 flex-wrap gap-3"
            style={{ borderTop: `1px solid ${T.cardBorder}` }}
          >
            <span
              className="text-xs"
              style={{ color: T.inkFaint, fontFamily: "'Inter', sans-serif" }}
            >
              Showing{" "}
              {sorted.length === 0
                ? 0
                : (page - 1) * PAGE_SIZE + 1}
              –{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg disabled:opacity-30 transition-colors"
                style={{ color: T.inkDim, background: T.surfaceMute }}
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: totalPages })
                .slice(0, 6)
                .map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-6 h-6 rounded-lg text-xs font-medium transition-all duration-150"
                      style={{
                        background: p === page ? T.primary : T.surfaceMute,
                        color: p === page ? "#FFF8EC" : T.inkDim,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg disabled:opacity-30 transition-colors"
                style={{ color: T.inkDim, background: T.surfaceMute }}
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
