import {
  STATUS,
  Status,
  DB_TYPES,
  DbType,
  REGIONS,
  Region,
  SEVERITIES,
  Severity,
  ENGINEERS,
  Engineer,
} from "../constants";

export { STATUS, DB_TYPES, REGIONS, SEVERITIES, ENGINEERS };
export type { Status, DbType, Region, Severity, Engineer };

export interface MetricHistoryPoint {
  hour: string;
  cpu: number;
  memory: number;
  connections: number;
}

export interface LogEntry {
  id: string;
  message: string;
  time: Date;
}

export interface Database {
  id: string;
  name: string;
  type: DbType;
  region: Region;
  status: Status;
  version: string;
  host: string;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  storageUsed: number;
  storageCapacity: number;
  uptime: string;
  uptimePct: number;
  responseMs: number;
  createdDaysAgo: number;
  lastBackup: Date;
  logs: LogEntry[];
  history: MetricHistoryPoint[];
}

export interface Alert {
  id: string;
  severity: Severity;
  database: string;
  region: Region;
  issue: string;
  detected: Date;
  status: "Open" | "Investigating" | "Resolved";
  engineer: Engineer;
}

export interface Incident {
  id: string;
  database: string;
  region: Region;
  status: "Active" | "Resolved";
  start: Date;
  durationMin: number;
  rootCause: string;
  estRecoveryMin: number;
}

export interface Theme {
  mode: string;
  bg: string;
  bgInk: string;
  bgInkDim: string;
  bgInkFaint: string;
  card: string;
  cardBorder: string;
  surfaceMute: string;
  ink: string;
  inkDim: string;
  inkFaint: string;
  primary: string;
  primaryBg: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  info: string;
  infoBg: string;
  auroraA: string;
  auroraB: string;
  auroraC: string;
  headerBg: string;
  chromeBg: string;
  chromeBorder: string;
}

export interface DataColumn {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

export interface ChartKeyConfig {
  key: string;
  name: string;
  color: string;
}

export interface SparklinePoint {
  i: number;
  v: number;
}

export interface SeriesPoint {
  label: string;
  value: number;
}
