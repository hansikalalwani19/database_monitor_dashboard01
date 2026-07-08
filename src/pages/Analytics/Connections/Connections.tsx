import React, { useState, useMemo } from "react";
import { Activity, TrendingUp, Wifi, ShieldAlert, Clock, Network } from "lucide-react";
import { Theme, Database, REGIONS, DB_TYPES } from "../../../types";
import { PageShell, PageHeader } from "../../../components/layout";
import { KPICard, StatusPill, InsightCard } from "../../../components/common";
import { DataTable } from "../../../components/tables";
import { ChartCard, AreaTrend, BarCompare, DonutChart } from "../../../components/charts";
import { exportCSV } from "../../../utils/chart";
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

export function Connections({ T, fleet, phase, ready, go, range, setRange, refreshing, handleRefresh }: Props) {
  const [search, setSearch] = useState("");
  const current = fleet.reduce((s, d) => s + d.activeConnections, 0);
  const peak = Math.round(current * 1.32);
  const avg = Math.round(current * 0.86);
  const failedLogins = Math.round(fleet.length * 0.4);

  const trend = useMemo(() =>
    Array.from({ length: 24 }, (_, h) => {
      const vals = fleet.map((d) => d.history[h]?.connections ?? 0);
      return { label: `${h}:00`, value: vals.reduce((a, b) => a + b, 0) };
    }), [fleet]);

  const byRegion = REGIONS.map((r) => ({
    label: r,
    value: fleet.filter((d) => d.region === r).reduce((s, d) => s + d.activeConnections, 0),
  }));

  const byType = DB_TYPES.map((t) => ({
    label: t,
    value: fleet.filter((d) => d.type === t).reduce((s, d) => s + d.activeConnections, 0),
  }));

  const busyHours = useMemo(() =>
    Array.from({ length: 24 }, (_, h) => ({ label: `${h}`, value: trend[h]?.value || 0 })), [trend]);

  const topConnected = fleet.slice().sort((a, b) => b.activeConnections - a.activeConnections).slice(0, 10);
  const filtered = useMemo(() => fleet.filter((d) => !search.trim() || d.name.toLowerCase().includes(search.toLowerCase())), [fleet, search]);

  const columns: DataColumn[] = [
    { key: "name", label: "Database" },
    { key: "type", label: "Type" },
    { key: "region", label: "Region" },
    { key: "activeConnections", label: "Connections" },
    { key: "status", label: "Status", render: (r) => <StatusPill status={(r as Database).status} T={T} /> },
  ];

  const colors = [T.primary, T.success, T.info, T.warning, T.error];

  return (
    <PageShell>
      <PageHeader T={T} icon={Activity} title="Connection Analytics" description="Live and historical connection load, session behavior, and network activity." trail={["Dashboard", "Connection Analytics"]} onJump={(i) => i === 0 && go("home")} range={range} onRange={setRange} onRefresh={handleRefresh} refreshing={refreshing} onExportCSV={() => exportCSV(filtered, columns, "connections.csv")} onExportPDF={() => window.print()} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KPICard T={T} ready={ready} icon={Activity} label="Current connections" value={current} accent={T.primary} />
        <KPICard T={T} ready={ready} delay={40} icon={TrendingUp} label="Peak connections" value={peak} accent={T.warning} />
        <KPICard T={T} ready={ready} delay={80} icon={Wifi} label="Average connections" value={avg} accent={T.info} />
        <KPICard T={T} ready={ready} delay={120} icon={ShieldAlert} label="Failed logins" value={failedLogins} accent={T.error} invert />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2">
          <ChartCard T={T} title="Real-time connection load" subtitle="Fleet-wide, last 24 hours">
            <AreaTrend data={trend} T={T} keys={[{ key: "value", name: "Connections", color: T.primary }]} height={260} />
          </ChartCard>
        </div>
        <ChartCard T={T} title="Connections by type" subtitle="Share by engine">
          <DonutChart data={byType.map((b, i) => ({ name: b.label, value: b.value, color: colors[i] }))} T={T} centerValue={current} centerLabel="active now" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <ChartCard T={T} title="Connections by region" subtitle="Current distribution">
          <BarCompare data={byRegion} T={T} color={T.info} horizontal />
        </ChartCard>
        <ChartCard T={T} title="Busy hours" subtitle="Connection volume by hour of day">
          <BarCompare data={busyHours} T={T} color={T.primary} height={220} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl p-4 sm:p-5" style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
          <p className="text-sm font-semibold mb-3">Top connected databases</p>
          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
            {topConnected.map((d, i) => (
              <div key={d.id} onClick={() => go("detail", { id: d.id, from: "connections" })} className="flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-colors" style={{ background: T.surfaceMute }}>
                <span className="text-xs font-medium">{i + 1}. {d.name}</span>
                <span className="text-xs font-medium" style={{ color: T.primary }}>{d.activeConnections}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InsightCard T={T} icon={Clock} label="Avg session duration" value="4m 12s" accent={T.primary} />
          <InsightCard T={T} icon={Network} label="Connection type" value="92% pooled, 8% direct" accent={T.info} />
        </div>
      </div>

      <div className="mt-5">
        <DataTable T={T} columns={columns} rows={filtered} phase={phase} onRowClick={(r) => go("detail", { id: (r as Database).id, from: "connections" })} emptyTitle="No matching databases" onClear={() => setSearch("")} filename="connections.csv" search={search} onSearch={setSearch} />
      </div>
    </PageShell>
  );
}
