import React from "react";
import { LucideIcon, RefreshCw, Download, FileDown } from "lucide-react";
import { Theme } from "../../types";
import { Breadcrumb } from "./Breadcrumb";
import { DateRangePicker } from "./DateRangePicker";

export function PageHeader({
  T,
  trail,
  onJump,
  icon: Icon,
  title,
  description,
  range,
  onRange,
  onRefresh,
  refreshing,
  onExportCSV,
  onExportPDF,
}: {
  T: Theme;
  trail: string[];
  onJump: (index: number) => void;
  icon: LucideIcon;
  title: string;
  description: string;
  range: string;
  onRange: (v: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  onExportCSV: () => void;
  onExportPDF: () => void;
}) {
  return (
    <div className="mb-6">
      <Breadcrumb trail={trail} T={T} onJump={onJump} />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: T.primaryBg }}
          >
            <Icon size={20} style={{ color: T.primary }} />
          </div>
          <div>
            <h1
              className="text-2xl font-semibold leading-tight"
              style={{ color: T.bgInk, fontFamily: "'Fraunces', serif" }}
            >
              {title}
            </h1>
            <p
              className="text-sm mt-1 max-w-xl"
              style={{ color: T.bgInkDim, fontFamily: "'Inter', sans-serif" }}
            >
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangePicker value={range} onChange={onRange} T={T} />
          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-transform duration-150 hover:-translate-y-0.5"
            style={{
              background: T.chromeBg,
              border: `1px solid ${T.chromeBorder}`,
              color: T.bgInk,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <FileDown size={13} /> PDF
          </button>
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-transform duration-150 hover:-translate-y-0.5"
            style={{
              background: T.chromeBg,
              border: `1px solid ${T.chromeBorder}`,
              color: T.bgInk,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Download size={13} /> CSV
          </button>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-50"
            style={{
              background: T.chromeBg,
              border: `1px solid ${T.chromeBorder}`,
              color: T.bgInk,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <RefreshCw
              size={13}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
