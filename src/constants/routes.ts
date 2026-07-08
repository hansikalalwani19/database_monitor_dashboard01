export const ROUTES = {
  HOME: "home",
  INVENTORY: "inventory",
  HEALTH: "health",
  ALERTS: "alerts",
  INCIDENTS: "incidents",
  CPU: "cpu",
  MEMORY: "memory",
  CONNECTIONS: "connections",
  DETAIL: "detail",
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];

export const FROM_LABEL: Record<string, string> = {
  home: "Dashboard",
  inventory: "Database Inventory",
  health: "Health Monitoring",
  alerts: "Alert Center",
  incidents: "Incident Management",
  cpu: "CPU Analytics",
  memory: "Memory Analytics",
  connections: "Connection Analytics",
};
