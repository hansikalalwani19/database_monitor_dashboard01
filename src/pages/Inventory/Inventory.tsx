import React, { useState, useMemo } from "react";
import {
  Database,
  HardDrive,
  Layers,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Theme, Database as DatabaseType, DB_TYPES, REGIONS } from "../../types";
import { PageShell } from "../../components/layout";
import { PageHeader } from "../../components/layout";
import { FilterBar } from "../../components/layout";
import { KPICard, StatusPill, InsightCard } from "../../components/common";
import { DataTable } from "../../components/tables";
import { ChartCard, DonutChart, BarCompare, AreaTrend } from "../../components/charts";
import { sparklineFor, seriesFor } from "../../services/mockData";
import { exportCSV } from "../../utils/chart";
import { DataColumn } from "../../types";

interface InventoryPageProps {
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

export function Inventory({
  T,
  fleet,
  phase,
  ready,
  go,
  range,
  setRange,
  refreshing,
  handleRefresh,
}: InventoryPageProps) {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const typeDist = useMemo(() => {
    const colors = [T.primary, T.success, T.info, T.warning, T.error];
    return DB_TYPES.map((t, i) => ({
      name: t,
      value: fleet.filter((d) => d.type === t).length,
      color: colors[i % colors.length],
    }));
  }, [fleet, T]);

  const regionDist = useMemo(
    () =>
      REGIONS.map((r) => ({
        label: r,
        value: fleet.filter((d) => d.region === r).length,
      })),
    [fleet]
  );

  const growth = useMemo(() => {
    const len = range === "Today" ? 24 : range === "7D" ? 7 : range === "30D" ? 30 : 90;
    return seriesFor(9, len, Math.max(4, fleet.length - len * 0.3), 1.4).map((p, i) => ({
      ...p,
      label: range === "Today" ? p.label : `D${i + 1}`,
    }));
  }, [range, fleet.length]);

  const totalStorage = fleet.reduce((s, d) => s + d.storageCapacity, 0);
  const usedStorage = fleet.reduce((s, d) => s + d.storageUsed, 0);
  const mostUsedType = typeDist.slice().sort((a, b) => b.value - a.value)[0];
  const largestConsumer = fleet.slice().sort((a, b) => b.storageUsed - a.storageUsed)[0];

  const filtered = useMemo(() => {
    let rows = fleet;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((d) => d.name.toLowerCase().includes(q));
    }
    if (regionFilter !== "All") rows = rows.filter((d) => d.region === regionFilter);
    if (typeFilter !== "All") rows = rows.filter((d) => d.type === typeFilter);
    return rows;
  }, [fleet, search, regionFilter, typeFilter]);

  const columns: DataColumn[] = [
    { key: "name", label: "Database" },
    { key: "type", label: "Type" },
    { key: "version", label: "Version" },
    { key: "host", label: "Host" },
    { key: "region", label: "Region" },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusPill status={(r as DatabaseType).status} T={T} />,
    },
    { key: "cpuUsage", label: "CPU", render: (r) => `${(r as DatabaseType).cpuUsage}%` },
    { key: "memoryUsage", label: "Memory", render: (r) => `${(r as DatabaseType).memoryUsage}%` },
    {
      key: "storageUsed",
      label: "Storage",
      render: (r) => `${(r as DatabaseType).storageUsed}/${(r as DatabaseType).storageCapacity} GB`,
    },
    { key: "activeConnections", label: "Connections" },
    { key: "uptime", label: "Uptime" },
  ];

  return (
    <PageShell>
      <PageHeader
        T={T}
        icon={Database}
        title="Database Inventory"
        description="Full fleet overview across every region and engine — capacity, distribution, and growth."
        trail={["Dashboard", "Database Inventory"]}
        onJump={(i) => i === 0 && go("home")}
        range={range}
        onRange={setRange}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onExportCSV={() => exportCSV(filtered, columns, "inventory.csv")}
        onExportPDF={() => window.print()}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KPICard
          T={T}
          ready={ready}
          icon={Database}
          label="Total databases"
          value={fleet.length}
          accent={T.primary}
          sub="Across 5 regions"
          spark={sparklineFor(11, fleet.length || 1)}
        />
        <KPICard
          T={T}
          ready={ready}
          delay={40}
          icon={HardDrive}
          label="Storage capacity"
          value={`${(totalStorage / 1000).toFixed(1)} TB`}
          accent={T.info}
          sub={`${Math.round((usedStorage / totalStorage) * 100)}% utilized`}
        />
        <KPICard
          T={T}
          ready={ready}
          delay={80}
          icon={Layers}
          label="Most common type"
          value={mostUsedType?.name || "—"}
          accent={T.success}
          sub={`${mostUsedType?.value || 0} instances`}
        />
        <KPICard
          T={T}
          ready={ready}
          delay={120}
          icon={TrendingUp}
          label="Growth (period)"
          value={`+${growth.length ? Math.max(0, growth[growth.length - 1].value - growth[0].value) : 0}`}
          accent={T.primary}
          sub="Net new instances"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <ChartCard T={T} title="Type distribution" subtitle="Share of engines across the fleet">
          <DonutChart data={typeDist} T={T} centerValue={fleet.length} centerLabel="databases" />
        </ChartCard>
        <ChartCard T={T} title="Regional distribution" subtitle="Instance count per region">
          <BarCompare data={regionDist} T={T} color={T.primary} horizontal />
        </ChartCard>
        <ChartCard T={T} title="Fleet growth" subtitle={`Trend over ${range}`}>
          <AreaTrend data={growth} T={T} keys={[{ key: "value", name: "Databases", color: T.success }]} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <InsightCard T={T} icon={Layers} label="Most used type" value={`${mostUsedType?.name} (${mostUsedType?.value})`} accent={T.primary} />
        <InsightCard T={T} icon={HardDrive} label="Largest storage consumer" value={largestConsumer?.name || "—"} accent={T.warning} />
        <InsightCard T={T} icon={Zap} label="Recently added" value="orders-staging, users-prod..." accent={T.success} />
        <InsightCard T={T} icon={TrendingUp} label="Storage forecast (30d)" value={`${(usedStorage * 1.08 / 1000).toFixed(1)} TB`} accent={T.info} />
      </div>

      <FilterBar
        T={T}
        search={search}
        onSearch={setSearch}
        filters={[
          { label: "Regions", value: regionFilter, onChange: setRegionFilter, options: ["All", ...REGIONS] },
          { label: "Types", value: typeFilter, onChange: setTypeFilter, options: ["All", ...DB_TYPES] },
        ]}
        activeChips={[
          ...(search ? [{ label: `"${search}"`, onRemove: () => setSearch("") }] : []),
          ...(regionFilter !== "All" ? [{ label: regionFilter, onRemove: () => setRegionFilter("All") }] : []),
          ...(typeFilter !== "All" ? [{ label: typeFilter, onRemove: () => setTypeFilter("All") }] : []),
        ]}
        onClearAll={() => {
          setSearch("");
          setRegionFilter("All");
          setTypeFilter("All");
        }}
      />

      <DataTable
        T={T}
        columns={columns}
        rows={filtered}
        phase={phase}
        onRowClick={(r) => go("detail", { id: (r as DatabaseType).id, from: "inventory" })}
        emptyTitle="No databases match"
        emptySub="Adjust the region or type filters."
        onClear={() => {
          setSearch("");
          setRegionFilter("All");
          setTypeFilter("All");
        }}
        filename="inventory.csv"
        search={search}
        onSearch={setSearch}
        searchable={false}
      />
    </PageShell>
  );
}
