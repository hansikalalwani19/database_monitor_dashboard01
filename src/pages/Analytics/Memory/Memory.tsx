import React, { useState, useMemo } from "react";
import { MemoryStick, HardDrive, Layers, Zap } from "lucide-react";
import { Theme, Database, REGIONS } from "../../../types";
import { PageShell, PageHeader, RecommendationPanel } from "../../../components/layout";
import { KPICard, StatusPill, MetricBar } from "../../../components/common";
import { DataTable } from "../../../components/tables";
import { ChartCard, AreaTrend, BarCompare, DonutChart } from "../../../components/charts";
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

export function Memory({ T, fleet, phase, ready, go, range, setRange, refreshing, handleRefresh }: Props) {
  const [search, setSearch] = useState("");
  const avgMem = fleet.length ? Math.round(fleet.reduce((s, d) => s + d.memoryUsage, 0) / fleet.length) : 0;
  const totalAllocGB = fleet.length * 32;
  const freeGB = Math.round(totalAllocGB * (1 - avgMem / 100));
  const cacheHit = Math.min(99, 82 + Math.round((100 - avgMem) / 8));

  const trend = useMemo(() =>
    Array.from({ length: 24 }, (_, h) => {
      const vals = fleet.map((d) => d.history[h]?.memory ?? 0);
      return { label: `${h}:00`, value: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0 };
    }), [fleet]);

  const byRegion = REGIONS.map((r) => {
    const rows = fleet.filter((d) => d.region === r);
    return { label: r, value: rows.length ? Math.round(rows.reduce((s, d) => s + d.memoryUsage, 0) / rows.length) : 0 };
  });

  const pressure = [
    { name: "Low (<50%)", value: fleet.filter((d) => d.memoryUsage < 50).length, color: T.success },
    { name: "Medium (50-80%)", value: fleet.filter((d) => d.memoryUsage >= 50 && d.memoryUsage < 80).length, color: T.warning },
    { name: "High (>=80%)", value: fleet.filter((d) => d.memoryUsage >= 80).length, color: T.error },
  ];

  const topConsumers = fleet.slice().sort((a, b) => b.memoryUsage - a.memoryUsage).slice(0, 10);
  const filtered = useMemo(() => fleet.filter((d) => !search.trim() || d.name.toLowerCase().includes(search.toLowerCase())), [fleet, search]);

  const columns: DataColumn[] = [
    { key: "name", label: "Database" },
    { key: "type", label: "Type" },
    { key: "region", label: "Region" },
    { key: "memoryUsage", label: "Memory", render: (r) => <div className="flex items-center gap-2"><MetricBar value={(r as Database).memoryUsage} color={metricColor((r as Database).memoryUsage, T)} T={T} /><span>{(r as Database).memoryUsage}%</span></div> },
    { key: "status", label: "Status", render: (r) => <StatusPill status={(r as Database).status} T={T} /> },
  ];

  return (
    <PageShell>
      <PageHeader T={T} icon={MemoryStick} title="Memory Analytics" description="Allocation, pressure, and cache performance across every instance." trail={["Dashboard", "Memory Analytics"]} onJump={(i) => i === 0 && go("home")} range={range} onRange={setRange} onRefresh={handleRefresh} refreshing={refreshing} onExportCSV={() => exportCSV(filtered, columns, "memory.csv")} onExportPDF={() => window.print()} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KPICard T={T} ready={ready} icon={MemoryStick} label="Average memory" value={`${avgMem}%`} accent={metricColor(avgMem, T)} invert />
        <KPICard T={T} ready={ready} delay={40} icon={HardDrive} label="Total allocated" value={`${totalAllocGB} GB`} accent={T.info} />
        <KPICard T={T} ready={ready} delay={80} icon={Layers} label="Free memory" value={`${freeGB} GB`} accent={T.success} />
        <KPICard T={T} ready={ready} delay={120} icon={Zap} label="Cache hit rate" value={`${cacheHit}%`} accent={T.primary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2">
          <ChartCard T={T} title="24-hour memory trend" subtitle="Fleet-wide average">
            <AreaTrend data={trend} T={T} keys={[{ key: "value", name: "Memory %", color: T.warning }]} height={260} />
          </ChartCard>
        </div>
        <ChartCard T={T} title="Memory pressure" subtitle="Instances by pressure band">
          <DonutChart data={pressure} T={T} centerValue={fleet.length} centerLabel="databases" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <ChartCard T={T} title="Memory by region" subtitle="Average utilization">
          <BarCompare data={byRegion} T={T} color={T.info} horizontal />
        </ChartCard>
        <div className="rounded-xl p-4 sm:p-5" style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
          <p className="text-sm font-semibold mb-3">Top memory consumers</p>
          <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
            {topConsumers.map((d, i) => (
              <div key={d.id} onClick={() => go("detail", { id: d.id, from: "memory" })} className="flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-colors" style={{ background: T.surfaceMute }}>
                <span className="text-xs font-medium">{i + 1}. {d.name}</span>
                <span className="text-xs font-medium" style={{ color: metricColor(d.memoryUsage, T) }}>{d.memoryUsage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RecommendationPanel T={T} accent={T.warning} items={[
        "Instances above 80% memory utilization risk eviction storms — consider increasing allocation.",
        "Low cache hit rates often trace back to working sets exceeding available memory; review query patterns.",
        "Redis and MongoDB instances typically benefit most from targeted memory-limit tuning.",
      ]} />

      <div className="mt-5">
        <DataTable T={T} columns={columns} rows={filtered} phase={phase} onRowClick={(r) => go("detail", { id: (r as Database).id, from: "memory" })} emptyTitle="No matching databases" onClear={() => setSearch("")} filename="memory.csv" search={search} onSearch={setSearch} />
      </div>
    </PageShell>
  );
}
