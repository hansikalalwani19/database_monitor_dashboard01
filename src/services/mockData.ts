import {
  Database,
  Alert,
  Incident,
  MetricHistoryPoint,
} from "../types";
import {
  STATUS,
  DB_TYPES,
  REGIONS,
  SEVERITIES,
  ENGINEERS,
} from "../constants";

function makeRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const DB_NAME_PREFIXES = [
  "orders", "users", "analytics", "billing", "sessions", "inventory",
  "catalog", "payments", "notifications", "search-index", "audit-log",
  "reporting", "auth", "cache", "recommendations", "geo-lookup",
  "events", "shipments", "reviews", "media-meta", "queue-state",
  "config", "feature-flags", "crm", "warehouse", "ledger",
  "telemetry", "profiles", "gateway", "pricing", "loyalty",
  "support-tickets", "fraud-detect", "content",
];

const LOG_MESSAGES = [
  "Database started successfully",
  "Backup completed",
  "High CPU usage detected",
  "Connection established",
  "Storage usage exceeded 80%",
  "Warning resolved",
  "Replication lag detected",
  "Slow query flagged",
  "Automatic failover triggered",
  "Connection pool exhausted",
];

const INCIDENT_CAUSES = [
  "Node crash — out of memory",
  "Network partition",
  "Disk failure",
  "Failed migration rollback",
  "Upstream dependency outage",
  "Manual maintenance overrun",
];

const ALERT_ISSUES = [
  "CPU sustained above 80%",
  "Memory pressure detected",
  "Replication lag > 5s",
  "Storage above 80% capacity",
  "Slow query rate increasing",
  "Connection pool near limit",
];

const VERSION_MAP: Record<string, string> = {
  MySQL: "8.0.36",
  PostgreSQL: "16.2",
  MongoDB: "7.0.8",
  Redis: "7.2.4",
  "SQL Server": "2022 CU12",
};

function generateHistory(
  cpuBase: number,
  memBase: number,
  connections: number,
  rng: () => number
): MetricHistoryPoint[] {
  return Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}:00`,
    cpu: Math.max(0, Math.min(100, Math.round(cpuBase + (rng() - 0.5) * 20))),
    memory: Math.max(0, Math.min(100, Math.round(memBase + (rng() - 0.5) * 16))),
    connections: Math.max(0, Math.round(connections * (0.6 + rng() * 0.5))),
  }));
}

function generateLogs(dbIndex: number, rng: () => number) {
  const logCount = 3 + Math.floor(rng() * 3);
  return Array.from({ length: logCount }, (_, li) => ({
    id: `${dbIndex}-${li}`,
    message: LOG_MESSAGES[Math.floor(rng() * LOG_MESSAGES.length)],
    time: new Date(Date.now() - (li + 1) * (1000 + rng() * 6000) * 60),
  }));
}

export function generateFleet(): Database[] {
  const rng = makeRng(42);
  const suffixes = ["prod", "prod-replica", "staging", "prod-01", "prod-02", "primary"];

  return DB_NAME_PREFIXES.map((prefix, i) => {
    const type = DB_TYPES[Math.floor(rng() * DB_TYPES.length)];
    const region = REGIONS[Math.floor(rng() * REGIONS.length)];
    const roll = rng();
    const status = roll > 0.86 ? STATUS.OFFLINE : roll > 0.66 ? STATUS.WARNING : STATUS.HEALTHY;

    const cpuBase = status === STATUS.OFFLINE
      ? rng() * 8
      : status === STATUS.WARNING
        ? 68 + rng() * 27
        : 8 + rng() * 55;

    const memBase = status === STATUS.OFFLINE
      ? rng() * 5
      : status === STATUS.WARNING
        ? 70 + rng() * 25
        : 15 + rng() * 55;

    const storageCapacity = [100, 250, 500, 1000, 2000][Math.floor(rng() * 5)] as number;
    const storageUsed = Math.round(
      storageCapacity * (0.2 + rng() * (status === STATUS.WARNING ? 0.7 : 0.55))
    );
    const connections = status === STATUS.OFFLINE ? 0 : Math.round(20 + rng() * 480);
    const uptimeDays = status === STATUS.OFFLINE ? 0 : Math.floor(rng() * 240) + 1;
    const uptimeHrs = Math.floor(rng() * 24);
    const uptimePct = status === STATUS.OFFLINE ? 0 : 97 + rng() * 2.9;

    return {
      id: `db-${i + 1}`,
      name: `${prefix}-${suffixes[Math.floor(rng() * suffixes.length)]}`,
      type,
      region,
      status,
      version: VERSION_MAP[type],
      host: `${prefix}.${region}.db.internal`,
      cpuUsage: Math.round(cpuBase),
      memoryUsage: Math.round(memBase),
      activeConnections: connections,
      storageUsed,
      storageCapacity,
      uptime: status === STATUS.OFFLINE ? "—" : `${uptimeDays}d ${uptimeHrs}h`,
      uptimePct: Number(uptimePct.toFixed(2)),
      responseMs: Math.round(4 + rng() * (status === STATUS.WARNING ? 90 : 30)),
      createdDaysAgo: Math.floor(rng() * 380),
      lastBackup: new Date(
        Date.now() - Math.floor(rng() * 30) * 3600 * 1000 - Math.floor(rng() * 59) * 60000
      ),
      logs: generateLogs(i, rng),
      history: generateHistory(cpuBase, memBase, connections, rng),
    };
  });
}

export function generateAlerts(fleet: Database[]): Alert[] {
  const rng = makeRng(77);
  const warningDbs = fleet.filter((d) => d.status === STATUS.WARNING);

  return warningDbs.map((d, i) => ({
    id: `alert-${i}`,
    severity: SEVERITIES[Math.floor(rng() * SEVERITIES.length)],
    database: d.name,
    region: d.region,
    issue: ALERT_ISSUES[Math.floor(rng() * ALERT_ISSUES.length)],
    detected: new Date(Date.now() - Math.floor(rng() * 60) * 60 * 60000),
    status: rng() > 0.35 ? "Open" : "Investigating",
    engineer: ENGINEERS[Math.floor(rng() * ENGINEERS.length)],
  }));
}

export function generateIncidents(fleet: Database[]): Incident[] {
  const rng = makeRng(123);
  const offlineDbs = fleet.filter((d) => d.status === STATUS.OFFLINE);

  return offlineDbs.map((d, i) => {
    const active = rng() > 0.4;
    const startedHoursAgo = 1 + Math.floor(rng() * 72);
    const start = new Date(Date.now() - startedHoursAgo * 3600000);
    const durationMin = active ? startedHoursAgo * 60 : Math.round(15 + rng() * 240);

    return {
      id: `inc-${i}`,
      database: d.name,
      region: d.region,
      status: active ? "Active" : "Resolved",
      start,
      durationMin,
      rootCause: INCIDENT_CAUSES[Math.floor(rng() * INCIDENT_CAUSES.length)],
      estRecoveryMin: active ? Math.round(20 + rng() * 90) : 0,
    };
  });
}

export function sparklineFor(seed: number, target: number, len = 12) {
  const rng = makeRng(seed);
  const pts: { i: number; v: number }[] = [];
  let v = target * (0.85 + rng() * 0.3);

  for (let i = 0; i < len; i++) {
    v += (rng() - 0.48) * target * 0.12;
    v = Math.max(0, v);
    pts.push({ i, v: Math.round(v) });
  }
  pts.push({ i: len, v: target });
  return pts;
}

export function seriesFor(seed: number, len: number, base: number, spread: number) {
  const rng = makeRng(seed);
  let v = base;

  return Array.from({ length: len }, (_, i) => {
    v += (rng() - 0.5) * spread;
    v = Math.max(0, v);
    return {
      label: len <= 24 ? `${i}:00` : `Day ${i + 1}`,
      value: Math.round(v),
    };
  });
}
