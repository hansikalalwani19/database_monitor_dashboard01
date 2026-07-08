export const STATUS = {
  HEALTHY: "Healthy",
  WARNING: "Warning",
  OFFLINE: "Offline",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

export const DB_TYPES = [
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "SQL Server",
] as const;

export type DbType = (typeof DB_TYPES)[number];

export const REGIONS = [
  "us-east-1",
  "us-west-2",
  "eu-west-1",
  "ap-southeast-1",
  "sa-east-1",
] as const;

export type Region = (typeof REGIONS)[number];

export const SEVERITIES = ["Critical", "Moderate", "Low"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const ENGINEERS = [
  "A. Reyes",
  "J. Okafor",
  "M. Lindgren",
  "P. Sato",
  "C. Duarte",
] as const;

export type Engineer = (typeof ENGINEERS)[number];
