import React, { useState, useMemo } from "react";
import { CheckCircle2, Gauge, Activity, Zap, ShieldAlert } from "lucide-react";
import { Theme, Database as DatabaseType, STATUS, REGIONS } from "../../types";
import { PageShell } from "../../components/layout";
import { PageHeader } from "../../components/layout";
import { RecommendationPanel } from "../../components/layout";
import { KPICard, StatusPill } from "../../components/common";
import { DataTable } from "../../components/tables";
import { ChartCard, GaugeRing, DonutChart, AreaTrend } from "../../components/charts";
import { seriesFor } from "../../services/mockData";
import { exportCSV } from "../../utils/chart";
import { DataColumn } from "../../types";

function makeRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

interface HealthPageProps {
  T: Theme;
  fleet: DatabaseType[];
  phase: "loading" | "ready" | "error";
  ready: boolean;
  go: (name: string, params?: Record<string, unknown>) => void;
  range: string;
  setRange: (v: string) => void;
  refreshing: boolean;
  handleRefresh: () => void;
}

export function Health({
  T,
  fleet,
  phase,
  ready,
  go,
  range,
  setRange,
  refreshing,
  handleRefresh,
}: HealthPageProps) {
  const [search, setSearch] = useState("");
  const healthy = fleet.filter((d) => d.status === STATUS.HEALTHY);
  const healthScore = Math.round((healthy.length / Math.max(1, fleet.length)) * 100);
  const avgUptime = healthy.length
    ? (healthy.reduce((s, d) => s + d.uptimePct, 0) / healthy.length).toFixed(2)
    : "0.00";
  const avgResponse = healthy.length
    ? Math.round(healthy.reduce((s, d) => s + d.responseMs, 0) / healthy.length)
    : 0;
  const critical = fleet.filter((d) => d.status === STATUS.OFFLINE).length;

  const pieData = [
    { name: "Healthy", value: healthy.length, color: T.success },
    { name: "Unhealthy", value: fleet.length - healthy.length, color: T.error },
  ];

  const availability = useMemo(() => {
    const len = range === "Today" ? 24 : range === "7D" ? 7 : range === "30D" ? 30 : 90;
    return seriesFor(21, len, 99, 0.6).map((p) => ({ ...p, value: Math.min(100, p.value) }));
  }, [range]);

  const topPerformers = healthy.slice().sort((a, b) => b.uptimePct - a.uptimePct).slice(0, 5);

  const timeline = Array.from({ length: 14 }, (_, i) => {
    const rng = makeRng(300 + i);
    const roll = rng();
    return { day: i, status: roll > 0.9 ? STATUS.OFFLINE : roll > 0.75 ? STATUS.WARNING : STATUS.HEALTHY };
  });

  const filtered = useMemo(
    () =>
      healthy.filter((d) => !search.trim() || d.name.toLowerCase().includes(search.toLowerCase())),
    [healthy, search]
  );

  const columns: DataColumn[] = [
    { key: "name", label: "Database" },
    { key: "type", label: "Type" },
    { key: "region", label: "Region" },
    { key: "uptimePct", label: "Uptime %", render: (r) => `${(r as DatabaseType).uptimePct}%` },
    { key: "responseMs", label: "Response", render: (r) => `${(r as DatabaseType).responseMs} ms` },
    { key: "cpuUsage", label: "CPU", render: (r) => `${(r as DatabaseType).cpuUsage}%` },
    { key: "memoryUsage", label: "Memory", render: (r) => `${(r as DatabaseType).memoryUsage}%` },
    {
      key: "lastBackup",
      label: "Last backup",
      render: (r) =>
        (r as DatabaseType).lastBackup.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
    },
  ];

  return (
    <PageShell>
      <PageHeader
        T={T}
        icon={CheckCircle2}
        title="Health Monitoring"
        description="Overall fleet health, availability trends, and top-performing instances."
        trail={["Dashboard", "Health Monitoring"]}
        onJump={(i) => i === 0 && go("home")}
        range={range}
        onRange={setRange}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onExportCSV={() => exportCSV(filtered, columns, "healthy.csv")}
        onExportPDF={() => window.print()}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KPICard T={T} ready={ready} icon={Gauge} label="Health score" value={healthScore} accent={T.success} sub="Percent of fleet healthy" />
        <KPICard T={T} ready={ready} delay={40} icon={Activity} label="Avg uptime" value={`${avgUptime}%`} accent={T.success} sub="Across healthy instances" />
        <KPICard T={T} ready={ready} delay={80} icon={Zap} label="Avg response time" value={`${avgResponse} ms`} accent={T.primary} sub="Query round-trip" />
        <KPICard T={T} ready={ready} delay={120} icon={ShieldAlert} label="Critical alerts" value={critical} accent={critical > 0 ? T.error : T.success} sub={critical > 0 ? "Needs attention" : "All clear"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <ChartCard T={T} title="Overall health" subtitle="Share of fleet in good standing">
          <div className="flex items-center justify-center py-2">
            <GaugeRing value={healthScore} T={T} color={T.success} label="fleet health" />
          </div>
        </ChartCard>
        <ChartCard T={T} title="Healthy vs. unhealthy" subtitle="Current snapshot">
          <DonutChart data={pieData} T={T} centerValue={`${healthScore}%`} centerLabel="healthy" />
        </ChartCard>
        <ChartCard T={T} title="Availability trend" subtitle={`Over ${range}`}>
          <AreaTrend data={availability} T={T} keys={[{ key: "value", name: "Availability %", color: T.success }]} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 rounded-xl p-4 sm:p-5" style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>
            Top performing databases
          </p>
          <div className="flex flex-col gap-2">
            {topPerformers.map((d, i) => (
              <div
                key={d.id}
                onClick={() => go("detail", { id: d.id, from: "health" })}
                className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors"
                style={{ background: T.surfaceMute }}
              >
                <span className="text-sm font-medium flex items-center gap-2" style={{ color: T.ink, fontFamily: "'Inter', sans-serif" }}>
                  <span
                    className="text-xs w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: T.primaryBg, color: T.primary }}
                  >
                    {i + 1}
                  </span>
                  {d.name}
                </span>
                <span className="text-xs" style={{ color: T.success, fontFamily: "'Inter', sans-serif" }}>
                  {d.uptimePct}% uptime
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-4 sm:p-5" style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>
            Health timeline (14d)
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {timeline.map((t) => {
              const map = { [STATUS.HEALTHY]: T.success, [STATUS.WARNING]: T.warning, [STATUS.OFFLINE]: T.error };
              return <div key={t.day} title={t.status} className="aspect-square rounded" style={{ background: map[t.status] }} />;
            })}
          </div>
          <p className="text-[11px] mt-2" style={{ color: T.inkFaint, fontFamily: "'Inter', sans-serif" }}>
            Fleet-wide daily status, most recent 14 days
          </p>
        </div>
      </div>

      <RecommendationPanel
        T={T}
        accent={T.success}
        items={[
          `${healthScore}% of databases are healthy — no fleet-wide action required.`,
          `Average uptime sits at ${avgUptime}%, comfortably above the 99.9% SLA target.`,
          critical > 0
            ? `${critical} instance(s) are offline — see Incident Management for recovery status.`
            : "No critical alerts are currently open.",
        ]}
      />

      <div className="mt-5">
        <DataTable
          T={T}
          columns={columns}
          rows={filtered}
          phase={phase}
          onRowClick={(r) => go("detail", { id: (r as DatabaseType).id, from: "health" })}
          emptyTitle="No healthy databases match"
          onClear={() => setSearch("")}
          filename="healthy.csv"
          search={search}
          onSearch={setSearch}
        />
      </div>
    </PageShell>
  );
}
