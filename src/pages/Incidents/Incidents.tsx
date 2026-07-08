import React, { useState, useMemo } from "react";
import { XCircle, CheckCircle2, Clock, ShieldAlert, Activity } from "lucide-react";
import { Theme, Incident as IncidentType, Database as DatabaseType } from "../../types";
import { PageShell } from "../../components/layout";
import { PageHeader } from "../../components/layout";
import { RecommendationPanel } from "../../components/layout";
import { KPICard, InsightCard } from "../../components/common";
import { DataTable } from "../../components/tables";
import { ChartCard, AreaTrend, BarCompare, GaugeRing } from "../../components/charts";
import { seriesFor } from "../../services/mockData";
import { exportCSV } from "../../utils/chart";
import { DataColumn } from "../../types";

interface IncidentsPageProps {
  T: Theme;
  fleet: DatabaseType[];
  incidents: IncidentType[];
  phase: "loading" | "ready" | "error";
  ready: boolean;
  go: (name: string, params?: Record<string, unknown>) => void;
  range: string;
  setRange: (v: string) => void;
  refreshing: boolean;
  handleRefresh: () => void;
}

export function Incidents({
  T,
  fleet,
  incidents,
  phase,
  ready,
  go,
  range,
  setRange,
  refreshing,
  handleRefresh,
}: IncidentsPageProps) {
  const [search, setSearch] = useState("");
  const active = incidents.filter((i) => i.status === "Active");
  const resolved = incidents.filter((i) => i.status === "Resolved");
  const avgDowntime = incidents.length
    ? Math.round(incidents.reduce((s, i) => s + i.durationMin, 0) / incidents.length)
    : 0;
  const slaCompliance = Math.max(0, 100 - active.length * 3.5).toFixed(1);

  const downtimeTrend = useMemo(() => {
    const len = range === "Today" ? 24 : range === "7D" ? 7 : range === "30D" ? 30 : 90;
    return seriesFor(88, len, Math.max(5, incidents.length * 12), 20);
  }, [range, incidents.length]);

  const byDbDuration = incidents.slice(0, 8).map((i) => ({
    label: i.database,
    value: i.durationMin,
  }));

  const regionsAffected = [...new Set(incidents.map((i) => i.region))];

  const filtered = useMemo(
    () =>
      incidents.filter(
        (i) => !search.trim() || i.database.toLowerCase().includes(search.toLowerCase())
      ),
    [incidents, search]
  );

  const columns: DataColumn[] = [
    { key: "database", label: "Database" },
    { key: "region", label: "Region" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            background: (r as IncidentType).status === "Active" ? T.errorBg : T.successBg,
            color: (r as IncidentType).status === "Active" ? T.error : T.success,
          }}
        >
          {(r as IncidentType).status}
        </span>
      ),
    },
    {
      key: "start",
      label: "Started",
      render: (r) =>
        (r as IncidentType).start.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      key: "durationMin",
      label: "Duration",
      render: (r) =>
        `${Math.round((r as IncidentType).durationMin / 60)}h ${(r as IncidentType).durationMin % 60}m`,
    },
    { key: "rootCause", label: "Root cause" },
    {
      key: "estRecoveryMin",
      label: "Est. recovery",
      render: (r) =>
        (r as IncidentType).status === "Active" ? `${(r as IncidentType).estRecoveryMin} min` : "—",
    },
  ];

  return (
    <PageShell>
      <PageHeader
        T={T}
        icon={XCircle}
        title="Incident Management"
        description="Active and resolved outages, downtime statistics, and recovery progress."
        trail={["Dashboard", "Incident Management"]}
        onJump={(i) => i === 0 && go("home")}
        range={range}
        onRange={setRange}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onExportCSV={() => exportCSV(filtered, columns, "incidents.csv")}
        onExportPDF={() => window.print()}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KPICard T={T} ready={ready} icon={XCircle} label="Active incidents" value={active.length} accent={T.error} invert sub="Ongoing right now" />
        <KPICard T={T} ready={ready} delay={40} icon={CheckCircle2} label="Resolved (30d)" value={resolved.length} accent={T.success} />
        <KPICard T={T} ready={ready} delay={80} icon={Clock} label="Avg downtime" value={`${avgDowntime} min`} accent={T.warning} invert />
        <KPICard T={T} ready={ready} delay={120} icon={ShieldAlert} label="SLA compliance" value={`${slaCompliance}%`} accent={T.info} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <ChartCard T={T} title="Downtime trend" subtitle={`Minutes lost over ${range}`}>
          <AreaTrend data={downtimeTrend} T={T} keys={[{ key: "value", name: "Downtime (min)", color: T.error }]} />
        </ChartCard>
        <ChartCard T={T} title="Outage duration" subtitle="Most recent incidents">
          <BarCompare data={byDbDuration} T={T} color={T.error} horizontal />
        </ChartCard>
        <div className="rounded-xl p-4 sm:p-5" style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>
            Recovery progress
          </p>
          <div className="grid grid-cols-3 gap-3">
            {active.slice(0, 3).map((inc) => {
              const pct = Math.min(95, Math.round((1 - inc.estRecoveryMin / 120) * 100));
              return (
                <div key={inc.id} className="flex flex-col items-center">
                  <GaugeRing value={Math.max(5, pct)} T={T} color={T.warning} size={92} label={inc.database} />
                </div>
              );
            })}
            {active.length === 0 && (
              <p className="text-xs col-span-3" style={{ color: T.inkFaint, fontFamily: "'Inter', sans-serif" }}>
                No active recoveries in progress.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl p-4 sm:p-5" style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>
            Incident timeline
          </p>
          <div className="relative flex flex-col gap-2 pl-4 max-h-64 overflow-y-auto">
            <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: T.cardBorder }} />
            {incidents.slice(0, 8).map((inc) => (
              <div
                key={inc.id}
                className="relative flex items-center justify-between text-xs px-3 py-2 rounded-lg"
                style={{ background: T.surfaceMute }}
              >
                <div
                  className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{ background: inc.status === "Active" ? T.error : T.success }}
                />
                <span style={{ color: T.ink, fontFamily: "'Inter', sans-serif" }}>
                  {inc.database} — {inc.rootCause}
                </span>
                <span style={{ color: T.inkFaint, fontFamily: "'Inter', sans-serif" }}>
                  {inc.start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
        <InsightCard T={T} icon={Activity} label="Affected regions" value={regionsAffected.join(", ") || "None"} accent={T.info} />
      </div>

      <RecommendationPanel
        T={T}
        accent={T.error}
        items={[
          "Node crashes tied to memory exhaustion — consider raising memory limits or sharding hot databases.",
          "Network partitions cluster in cross-region replicas; review inter-region link health.",
          "Automate failover for single points of failure identified in recent root-cause reviews.",
        ]}
      />

      <div className="mt-5">
        <DataTable
          T={T}
          columns={columns}
          rows={filtered}
          phase={phase}
          onRowClick={(r) => {
            const db = fleet.find((f) => f.name === (r as IncidentType).database);
            if (db) go("detail", { id: db.id, from: "incidents" });
          }}
          emptyTitle="No incidents recorded"
          onClear={() => setSearch("")}
          filename="incidents.csv"
          search={search}
          onSearch={setSearch}
        />
      </div>
    </PageShell>
  );
}
