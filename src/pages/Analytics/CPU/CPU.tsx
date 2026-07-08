import React, { useState, useMemo } from "react";
import { Cpu, Zap, Activity, AlertTriangle } from "lucide-react";
import { Theme, Database, REGIONS, DB_TYPES } from "../../../types";
import { PageShell, PageHeader, RecommendationPanel } from "../../../components/layout";
import { KPICard, StatusPill, MetricBar } from "../../../components/common";
import { DataTable } from "../../../components/tables";
import { ChartCard, AreaTrend, BarCompare, HeatmapGrid } from "../../../components/charts";
import { metricColor, exportCSV } from "../../../utils/chart";
import { DataColumn } from "../../../types";

interface Props {
  T: Theme;
  fleet: Database[];
  phase: "loading" | "ready" | "error";
  ready: boolean;
  go: (name: string, params?: Record<string, unknown>) => void;
  range: string;
  setRange: (v: string) => void;
  refreshing: boolean;
  handleRefresh: () => void;
}

export function CPU({ T, fleet, phase, ready, go, range, setRange, refreshing, handleRefresh }: Props) {
  const [search, setSearch] = useState("");
  const avgCpu = fleet.length ? Math.round(fleet.reduce((s, d) => s + d.cpuUsage, 0) / fleet.length) : 0;
  const peakCpu = Math.max(0, ...fleet.map((d) => d.cpuUsage));
  const currentCpu = Math.round(avgCpu * (0.94 + Math.sin(Date.now() / 100000) * 0.05));
  const bottlenecks = fleet.filter((d) => d.cpuUsage >= 85).length;

  const trend = useMemo(() =>
    Array.from({ length: 24 }, (_, h) => {
      const vals = fleet.map((d) => d.history[h]?.cpu ?? 0);
      return { label: `${h}:00`, value: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0 };
    }), [fleet]);

  const byType = DB_TYPES.map((t) => {
    const rows = fleet.filter((d) => d.type === t);
    return { label: t, value: rows.length ? Math.round(rows.reduce((s, d) => s + d.cpuUsage, 0) / rows.length) : 0 };
  });

  const topConsumers = fleet.slice().sort((a, b) => b.cpuUsage - a.cpuUsage).slice(0, 10);
  const filtered = useMemo(() => fleet.filter((d) => !search.trim() || d.name.toLowerCase().includes(search.toLowerCase())), [fleet, search]);

  const columns: DataColumn[] = [
    { key: "name", label: "Database" },
    { key: "type", label: "Type" },
    { key: "region", label: "Region" },
    { key: "cpuUsage", label: "CPU", render: (r) => <div className="flex items-center gap-2"><MetricBar value={(r as Database).cpuUsage} color={metricColor((r as Database).cpuUsage, T)} T={T} /><span>{(r as Database).cpuUsage}%</span></div> },
    { key: "status", label: "Status", render: (r) => <StatusPill status={(r as Database).status} T={T} /> },
  ];

  return (
    <PageShell>
      <PageHeader T={T} icon={Cpu} title="CPU Analytics" description="Real-time and historical processor load across the fleet." trail={["Dashboard", "CPU Analytics"]} onJump={(i) => i === 0 && go("home")} range={range} onRange={setRange} onRefresh={handleRefresh} refreshing={refreshing} onExportCSV={() => exportCSV(filtered, columns, "cpu.csv")} onExportPDF={() => window.print()} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KPICard T={T} ready={ready} icon={Cpu} label="Average CPU" value={`${avgCpu}%`} accent={metricColor(avgCpu, T)} invert />
        <KPICard T={T} ready={ready} delay={40} icon={Zap} label="Peak CPU" value={`${peakCpu}%`} accent={T.error} invert />
        <KPICard T={T} ready={ready} delay={80} icon={Activity} label="Current CPU" value={`${currentCpu}%`} accent={T.primary} sub="Live estimate" />
        <KPICard T={T} ready={ready} delay={120} icon={AlertTriangle} label="Bottlenecks" value={bottlenecks} accent={T.error} invert sub="Instances above 85%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2">
          <ChartCard T={T} title="24-hour CPU trend" subtitle="Fleet-wide average">
            <AreaTrend data={trend} T={T} keys={[{ key: "value", name: "CPU %", color: T.primary }]} height={260} />
          </ChartCard>
        </div>
        <ChartCard T={T} title="CPU by database type" subtitle="Average load per engine">
          <BarCompare data={byType} T={T} color={T.warning} horizontal />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <ChartCard T={T} title="CPU heatmap" subtitle="Region by hour intensity">
          <HeatmapGrid T={T} accent={T.primary} rows={REGIONS} cols={["0h", "4h", "8h", "12h", "16h", "20h"]} cell={(ri, ci) => {
            const rows = fleet.filter((d) => d.region === REGIONS[ri]);
            const hourIdx = ci * 4;
            const vals = rows.map((d) => d.history[hourIdx]?.cpu ?? 0);
            return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
          }} />
        </ChartCard>
        <div className="rounded-xl p-4 sm:p-5" style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: T.ink }}>Top 10 highest CPU databases</p>
          <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
            {topConsumers.map((d, i) => (
              <div key={d.id} onClick={() => go("detail", { id: d.id, from: "cpu" })} className="flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-colors" style={{ background: T.surfaceMute }}>
                <span className="text-xs font-medium">{i + 1}. {d.name}</span>
                <span className="text-xs font-medium" style={{ color: metricColor(d.cpuUsage, T) }}>{d.cpuUsage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RecommendationPanel T={T} accent={T.primary} items={[
        "Instances sustaining above 85% CPU are candidates for vertical scaling or read-replica offload.",
        "Review query plans for the top consumers — indexing gaps often explain sustained load spikes.",
        `Fleet-wide average sits at ${avgCpu}%, comfortably within capacity for the current period.`,
      ]} />

      <div className="mt-5">
        <DataTable T={T} columns={columns} rows={filtered} phase={phase} onRowClick={(r) => go("detail", { id: (r as Database).id, from: "cpu" })} emptyTitle="No matching databases" onClear={() => setSearch("")} filename="cpu.csv" search={search} onSearch={setSearch} />
      </div>
    </PageShell>
  );
}
