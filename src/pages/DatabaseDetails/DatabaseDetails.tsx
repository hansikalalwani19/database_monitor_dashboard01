import React, { useState } from "react";
import { Server, Activity, HardDrive } from "lucide-react";
import { Theme, Database as DatabaseType } from "../../types";
import { PageShell } from "../../components/layout";
import { Breadcrumb } from "../../components/layout";
import { StatusPill, DetailSection, DetailRow } from "../../components/common";
import { ChartCard, AreaTrend, GaugeRing } from "../../components/charts";
import { KPICard } from "../../components/common";
import { metricColor } from "../../utils/chart";

const FROM_LABEL: Record<string, string> = {
  home: "Dashboard",
  inventory: "Database Inventory",
  health: "Health Monitoring",
  alerts: "Alert Center",
  incidents: "Incident Management",
  cpu: "CPU Analytics",
  memory: "Memory Analytics",
  connections: "Connection Analytics",
};

const TABS = ["Overview", "Performance", "Storage", "Connections", "Logs"];

interface DatabaseDetailsProps {
  T: Theme;
  db: DatabaseType | undefined;
  from: string;
  go: (name: string) => void;
}

export function DatabaseDetails({ T, db, from, go }: DatabaseDetailsProps) {
  const [tab, setTab] = useState("Overview");

  if (!db) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <p className="font-semibold mb-1" style={{ color: T.ink, fontFamily: "'Fraunces', serif" }}>
            Database not found
          </p>
          <p className="text-sm mb-4" style={{ color: T.inkDim, fontFamily: "'Inter', sans-serif" }}>
            It may have been removed from the fleet.
          </p>
          <button
            onClick={() => go("home")}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-transform duration-150 hover:-translate-y-0.5"
            style={{ background: T.primaryBg, color: T.primary, fontFamily: "'Inter', sans-serif" }}
          >
            Return to Dashboard
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Breadcrumb T={T} trail={["Dashboard", FROM_LABEL[from] || "Dashboard", db.name]} onJump={(i) => (i === 0 ? go("home") : go(from))} />

      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: T.primaryBg }}
          >
            <Server size={20} style={{ color: T.primary }} />
          </div>
          <div>
            <h1
              className="text-2xl font-semibold leading-tight"
              style={{ color: T.bgInk, fontFamily: "'Fraunces', serif" }}
            >
              {db.name}
            </h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: T.bgInkDim, fontFamily: "'Inter', sans-serif" }}
            >
              {db.type} · {db.version} · {db.region}
            </p>
          </div>
        </div>
        <StatusPill status={db.status} T={T} />
      </div>

      <div
        className="flex items-center gap-1 mb-5 rounded-lg p-1 w-fit"
        style={{ background: T.surfaceMute }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-150"
            style={{
              background: tab === t ? T.card : "transparent",
              color: tab === t ? T.ink : T.inkDim,
              boxShadow: tab === t ? "0 1px 3px rgba(20,30,20,0.12)" : "none",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ animation: "fadeIn 0.2s ease-out" }}>
        {tab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl p-5" style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
              <DetailSection title="General" T={T}>
                <DetailRow label="Host" value={db.host} T={T} />
                <DetailRow label="Version" value={db.version} T={T} />
                <DetailRow label="Region" value={db.region} T={T} />
                <DetailRow label="Uptime" value={db.uptime} T={T} />
              </DetailSection>
            </div>
            <div className="rounded-xl p-5" style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
              <DetailSection title="Health" T={T}>
                <DetailRow label="Status" value={db.status} T={T} />
                <DetailRow label="Uptime %" value={`${db.uptimePct}%`} T={T} />
                <DetailRow label="Response time" value={`${db.responseMs} ms`} T={T} />
                <DetailRow
                  label="Last backup"
                  value={db.lastBackup.toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  T={T}
                />
              </DetailSection>
            </div>
          </div>
        )}

        {tab === "Performance" && (
          <ChartCard T={T} title="CPU & memory — last 24 hours" subtitle={`Current: CPU ${db.cpuUsage}% · Memory ${db.memoryUsage}%`}>
            <AreaTrend
              data={db.history.map((h) => ({ label: h.hour, cpu: h.cpu, memory: h.memory }))}
              T={T}
              keys={[
                { key: "cpu", name: "CPU", color: T.primary },
                { key: "memory", name: "Memory", color: T.warning },
              ]}
              height={280}
            />
          </ChartCard>
        )}

        {tab === "Storage" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div
              className="lg:col-span-1 rounded-xl p-5 flex flex-col items-center justify-center"
              style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}
            >
              <GaugeRing
                value={Math.round((db.storageUsed / db.storageCapacity) * 100)}
                T={T}
                color={metricColor(Math.round((db.storageUsed / db.storageCapacity) * 100), T)}
                label="capacity used"
              />
            </div>
            <div
              className="lg:col-span-2 rounded-xl p-5"
              style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}
            >
              <DetailSection title="Storage" T={T}>
                <DetailRow label="Capacity" value={`${db.storageCapacity} GB`} T={T} />
                <DetailRow label="Used" value={`${db.storageUsed} GB`} T={T} />
                <DetailRow label="Free" value={`${db.storageCapacity - db.storageUsed} GB`} T={T} />
                <DetailRow
                  label="Last backup"
                  value={db.lastBackup.toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  T={T}
                />
              </DetailSection>
            </div>
          </div>
        )}

        {tab === "Connections" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <KPICard T={T} ready icon={Activity} label="Active connections" value={db.activeConnections} accent={T.primary} />
            <div className="lg:col-span-2">
              <ChartCard T={T} title="Connections — last 24 hours" subtitle="Instance-level">
                <AreaTrend
                  data={db.history.map((h) => ({ label: h.hour, value: h.connections }))}
                  T={T}
                  keys={[{ key: "value", name: "Connections", color: T.info }]}
                />
              </ChartCard>
            </div>
          </div>
        )}

        {tab === "Logs" && (
          <div className="rounded-xl p-5" style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
            <p
              className="text-xs font-semibold mb-3 tracking-wide uppercase"
              style={{ color: T.inkFaint, fontFamily: "'Inter', sans-serif" }}
            >
              Recent logs
            </p>
            <div className="relative flex flex-col gap-1.5 pl-4">
              <div
                className="absolute left-[5px] top-1 bottom-1 w-px"
                style={{ background: T.cardBorder }}
              />
              {db.logs.map((log) => (
                <div
                  key={log.id}
                  className="relative flex items-center justify-between text-xs px-3 py-2.5 rounded-lg"
                  style={{ background: T.surfaceMute }}
                >
                  <div
                    className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                    style={{ background: T.primary }}
                  />
                  <span style={{ color: T.ink, fontFamily: "'Inter', sans-serif" }}>
                    {log.message}
                  </span>
                  <span style={{ color: T.inkFaint, fontFamily: "'Inter', sans-serif" }}>
                    {log.time.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
