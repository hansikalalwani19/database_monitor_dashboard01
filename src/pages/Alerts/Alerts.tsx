import React, { useState, useMemo } from "react";
import { AlertTriangle, AlertOctagon, FileWarning, Bell } from "lucide-react";
import { Theme, Alert as AlertType, Database as DatabaseType, SEVERITIES, REGIONS } from "../../types";
import { PageShell } from "../../components/layout";
import { PageHeader } from "../../components/layout";
import { RecommendationPanel } from "../../components/layout";
import { FilterBar } from "../../components/layout";
import { KPICard } from "../../components/common";
import { DataTable } from "../../components/tables";
import { ChartCard, BarCompare, AreaTrend, HeatmapGrid } from "../../components/charts";
import { seriesFor } from "../../services/mockData";
import { exportCSV } from "../../utils/chart";
import { DataColumn } from "../../types";

interface AlertsPageProps {
  T: Theme;
  fleet: DatabaseType[];
  alerts: AlertType[];
  setAlerts: React.Dispatch<React.SetStateAction<AlertType[]>>;
  phase: "loading" | "ready" | "error";
  ready: boolean;
  go: (name: string, params?: Record<string, unknown>) => void;
  range: string;
  setRange: (v: string) => void;
  refreshing: boolean;
  handleRefresh: () => void;
}

export function Alerts({
  T,
  fleet,
  alerts,
  setAlerts,
  phase,
  ready,
  go,
  range,
  setRange,
  refreshing,
  handleRefresh,
}: AlertsPageProps) {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");

  const bySeverity = SEVERITIES.map((s) => ({
    label: s,
    value: alerts.filter((a) => a.severity === s).length,
  }));

  const byRegion = REGIONS.map((r) => ({
    label: r,
    value: alerts.filter((a) => a.region === r).length,
  })).filter((r) => r.value > 0);

  const trend = useMemo(() => {
    const len = range === "Today" ? 24 : range === "7D" ? 7 : range === "30D" ? 30 : 90;
    return seriesFor(55, len, Math.max(2, alerts.length * 0.6), 1.2);
  }, [range, alerts.length]);

  const issueFreq = useMemo(() => {
    const counts: Record<string, number> = {};
    alerts.forEach((a) => {
      counts[a.issue] = (counts[a.issue] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [alerts]);

  const resolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Resolved" } : a))
    );
  };

  const filtered = useMemo(() => {
    let rows = alerts.filter((a) => a.status !== "Resolved");
    if (search.trim()) {
      rows = rows.filter((a) => a.database.toLowerCase().includes(search.toLowerCase()));
    }
    if (severityFilter !== "All") {
      rows = rows.filter((a) => a.severity === severityFilter);
    }
    return rows;
  }, [alerts, search, severityFilter]);

  const sevColor: Record<string, string> = {
    Critical: T.error,
    Moderate: T.warning,
    Low: T.info,
  };

  const columns: DataColumn[] = [
    {
      key: "severity",
      label: "Severity",
      render: (r) => (
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            background: `${sevColor[(r as AlertType).severity]}1E`,
            color: sevColor[(r as AlertType).severity],
          }}
        >
          {(r as AlertType).severity}
        </span>
      ),
    },
    { key: "database", label: "Database" },
    { key: "issue", label: "Issue" },
    {
      key: "detected",
      label: "Detected",
      render: (r) =>
        (r as AlertType).detected.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    { key: "status", label: "Status" },
    { key: "engineer", label: "Engineer" },
    {
      key: "resolve",
      label: "",
      render: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            resolve((r as AlertType).id);
          }}
          className="text-xs font-medium px-2.5 py-1 rounded-lg"
          style={{ background: T.successBg, color: T.success }}
        >
          Resolve
        </button>
      ),
    },
  ];

  return (
    <PageShell>
      <PageHeader
        T={T}
        icon={AlertTriangle}
        title="Alert Center"
        description="Active warnings across the fleet, grouped by severity, region, and root cause."
        trail={["Dashboard", "Alert Center"]}
        onJump={(i) => i === 0 && go("home")}
        range={range}
        onRange={setRange}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onExportCSV={() => exportCSV(filtered, columns.slice(0, 6), "alerts.csv")}
        onExportPDF={() => window.print()}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KPICard T={T} ready={ready} icon={AlertTriangle} label="Total warnings" value={filtered.length} accent={T.warning} invert sub="Currently open" />
        <KPICard T={T} ready={ready} delay={40} icon={AlertOctagon} label="Critical" value={alerts.filter((a) => a.severity === "Critical" && a.status !== "Resolved").length} accent={T.error} invert />
        <KPICard T={T} ready={ready} delay={80} icon={FileWarning} label="Moderate" value={alerts.filter((a) => a.severity === "Moderate" && a.status !== "Resolved").length} accent={T.warning} invert />
        <KPICard T={T} ready={ready} delay={120} icon={Bell} label="Low" value={alerts.filter((a) => a.severity === "Low" && a.status !== "Resolved").length} accent={T.info} invert />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <ChartCard T={T} title="Warnings by severity" subtitle="Open alerts">
          <BarCompare data={bySeverity} T={T} color={T.warning} />
        </ChartCard>
        <ChartCard T={T} title="Warnings by region" subtitle="Where issues concentrate">
          <BarCompare data={byRegion} T={T} color={T.error} horizontal />
        </ChartCard>
        <ChartCard T={T} title="Alert trend" subtitle={`Over ${range}`}>
          <AreaTrend data={trend} T={T} keys={[{ key: "value", name: "Alerts", color: T.warning }]} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <ChartCard T={T} title="Most frequent warning types" subtitle="Top 5 recurring issues">
          <BarCompare data={issueFreq} T={T} color={T.primary} horizontal height={200} />
        </ChartCard>
        <ChartCard T={T} title="Warning heatmap" subtitle="Severity by region density">
          <HeatmapGrid
            T={T}
            accent={T.warning}
            rows={SEVERITIES}
            cols={REGIONS.slice(0, 5)}
            cell={(ri, ci) => {
              const count = alerts.filter(
                (a) => a.severity === SEVERITIES[ri] && a.region === REGIONS[ci]
              ).length;
              return Math.min(100, count * 34);
            }}
          />
        </ChartCard>
      </div>

      <RecommendationPanel
        T={T}
        accent={T.warning}
        items={[
          "Databases flagged for CPU or memory pressure should be scaled or have query load redistributed.",
          "Replication lag warnings typically resolve by checking network throughput between regions.",
          "Storage-related warnings benefit from proactive archival policies before hitting 90% capacity.",
        ]}
      />

      <div className="mt-5">
        <FilterBar
          T={T}
          search={search}
          onSearch={setSearch}
          filters={[
            { label: "Severities", value: severityFilter, onChange: setSeverityFilter, options: ["All", ...SEVERITIES] },
          ]}
          activeChips={[
            ...(search ? [{ label: `"${search}"`, onRemove: () => setSearch("") }] : []),
            ...(severityFilter !== "All"
              ? [{ label: severityFilter, onRemove: () => setSeverityFilter("All") }]
              : []),
          ]}
          onClearAll={() => {
            setSearch("");
            setSeverityFilter("All");
          }}
        />
        <DataTable
          T={T}
          columns={columns}
          rows={filtered}
          phase={phase}
          emptyTitle="No open warnings"
          emptySub="Every alert has been resolved."
          filename="alerts.csv"
          search={search}
          onSearch={setSearch}
          searchable={false}
        />
      </div>
    </PageShell>
  );
}
