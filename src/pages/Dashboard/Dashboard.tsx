import React, { useState, useMemo } from "react";
import { Database, Calendar, Clock, CheckCircle2, AlertTriangle, XCircle, Cpu, MemoryStick, Activity } from "lucide-react";
import { Theme, Database as DatabaseType, STATUS, DB_TYPES } from "../../types";
import { PageShell } from "../../components/layout";
import { KPICard, StatusPill, MetricBar, Dropdown, EmptyState } from "../../components/common";
import { FilterBar } from "../../components/layout";
import { DataTable } from "../../components/tables";
import { sparklineFor } from "../../services/mockData";
import { metricColor } from "../../utils/chart";
import { DataColumn } from "../../types";

interface HomePageProps {
  T: Theme;
  fleet: DatabaseType[];
  phase: "loading" | "ready" | "error";
  ready: boolean;
  go: (name: string, params?: Record<string, unknown>) => void;
  now: Date;
  lastUpdated: Date;
}

export function Dashboard({
  T,
  fleet,
  phase,
  ready,
  go,
  now,
  lastUpdated,
}: HomePageProps) {
  const stats = useMemo(() => {
    const total = fleet.length;
    const healthy = fleet.filter((d) => d.status === STATUS.HEALTHY).length;
    const warning = fleet.filter((d) => d.status === STATUS.WARNING).length;
    const offline = fleet.filter((d) => d.status === STATUS.OFFLINE).length;
    const avgCpu = total ? Math.round(fleet.reduce((s, d) => s + d.cpuUsage, 0) / total) : 0;
    const avgMem = total ? Math.round(fleet.reduce((s, d) => s + d.memoryUsage, 0) / total) : 0;
    const conns = fleet.reduce((s, d) => s + d.activeConnections, 0);
    return { total, healthy, warning, offline, avgCpu, avgMem, conns };
  }, [fleet]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = useMemo(() => {
    let rows = fleet;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((d) => d.name.toLowerCase().includes(q));
    }
    if (statusFilter !== "All") rows = rows.filter((d) => d.status === statusFilter);
    if (typeFilter !== "All") rows = rows.filter((d) => d.type === typeFilter);
    return rows;
  }, [fleet, search, statusFilter, typeFilter]);

  const columns: DataColumn[] = [
    { key: "name", label: "Database" },
    { key: "type", label: "Type" },
    { key: "region", label: "Region" },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusPill status={(r as DatabaseType).status} T={T} />,
    },
    {
      key: "cpuUsage",
      label: "CPU",
      render: (r) => (
        <div className="flex items-center gap-2">
          <MetricBar value={(r as DatabaseType).cpuUsage} color={metricColor((r as DatabaseType).cpuUsage, T)} T={T} />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {(r as DatabaseType).cpuUsage}%
          </span>
        </div>
      ),
    },
    {
      key: "memoryUsage",
      label: "Memory",
      render: (r) => (
        <div className="flex items-center gap-2">
          <MetricBar value={(r as DatabaseType).memoryUsage} color={metricColor((r as DatabaseType).memoryUsage, T)} T={T} />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {(r as DatabaseType).memoryUsage}%
          </span>
        </div>
      ),
    },
    { key: "activeConnections", label: "Connections" },
    {
      key: "storageUsed",
      label: "Storage",
      render: (r) => `${(r as DatabaseType).storageUsed}/${(r as DatabaseType).storageCapacity} GB`,
    },
  ];

  return (
    <PageShell>
      <div className="mb-6">
        <h1
          className="text-2xl font-semibold leading-tight"
          style={{ color: T.bgInk, fontFamily: "'Fraunces', serif" }}
        >
          Database Monitoring
        </h1>
        <div
          className="flex items-center gap-2.5 text-xs mt-1"
          style={{ color: T.bgInkFaint, fontFamily: "'Inter', sans-serif" }}
        >
          <span className="flex items-center gap-1">
            <Calendar size={12} />{" "}
            {now.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> Updated{" "}
            {lastUpdated.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
        <KPICard
          T={T}
          ready={ready}
          delay={0}
          icon={Database}
          label="Total databases"
          value={stats.total}
          accent={T.primary}
          sub="View inventory"
          spark={sparklineFor(1, stats.total || 1)}
          onClick={() => go("inventory")}
        />
        <KPICard
          T={T}
          ready={ready}
          delay={40}
          icon={CheckCircle2}
          label="Healthy"
          value={stats.healthy}
          accent={T.success}
          trend={-2}
          sub="View health"
          spark={sparklineFor(2, stats.healthy || 1)}
          onClick={() => go("health")}
        />
        <KPICard
          T={T}
          ready={ready}
          delay={80}
          icon={AlertTriangle}
          label="Warning"
          value={stats.warning}
          accent={T.warning}
          trend={1}
          sub="View alerts"
          spark={sparklineFor(3, stats.warning || 1)}
          onClick={() => go("alerts")}
        />
        <KPICard
          T={T}
          ready={ready}
          delay={120}
          icon={XCircle}
          label="Offline"
          value={stats.offline}
          accent={T.error}
          trend={0}
          sub="View incidents"
          spark={sparklineFor(4, stats.offline || 1)}
          onClick={() => go("incidents")}
        />
        <KPICard
          T={T}
          ready={ready}
          delay={160}
          icon={Cpu}
          label="Avg CPU usage"
          value={stats.avgCpu}
          accent={T.primary}
          sub="View CPU analytics"
          spark={sparklineFor(5, stats.avgCpu || 1)}
          onClick={() => go("cpu")}
        />
        <KPICard
          T={T}
          ready={ready}
          delay={200}
          icon={MemoryStick}
          label="Avg memory usage"
          value={stats.avgMem}
          accent={T.primary}
          sub="View memory analytics"
          spark={sparklineFor(6, stats.avgMem || 1)}
          onClick={() => go("memory")}
        />
        <KPICard
          T={T}
          ready={ready}
          delay={240}
          icon={Activity}
          label="Active connections"
          value={stats.conns}
          accent={T.primary}
          sub="View connections"
          spark={sparklineFor(7, stats.conns || 1)}
          onClick={() => go("connections")}
        />
      </div>

      <FilterBar
        T={T}
        search={search}
        onSearch={setSearch}
        filters={[
          {
            label: "Statuses",
            value: statusFilter,
            onChange: setStatusFilter,
            options: ["All", STATUS.HEALTHY, STATUS.WARNING, STATUS.OFFLINE],
          },
          {
            label: "Types",
            value: typeFilter,
            onChange: setTypeFilter,
            options: ["All", ...DB_TYPES],
          },
        ]}
        activeChips={[
          ...(search ? [{ label: `"${search}"`, onRemove: () => setSearch("") }] : []),
          ...(statusFilter !== "All"
            ? [{ label: statusFilter, onRemove: () => setStatusFilter("All") }]
            : []),
          ...(typeFilter !== "All"
            ? [{ label: typeFilter, onRemove: () => setTypeFilter("All") }]
            : []),
        ]}
        onClearAll={() => {
          setSearch("");
          setStatusFilter("All");
          setTypeFilter("All");
        }}
      />

      <DataTable
        T={T}
        columns={columns}
        rows={filtered}
        phase={phase}
        onRowClick={(r) => go("detail", { id: (r as DatabaseType).id, from: "home" })}
        emptyTitle="No databases found"
        emptySub="Nothing matches the current search and filters."
        onClear={() => {
          setSearch("");
          setStatusFilter("All");
          setTypeFilter("All");
        }}
        filename="databases.csv"
        search={search}
        onSearch={setSearch}
        searchable={false}
      />
    </PageShell>
  );
}
