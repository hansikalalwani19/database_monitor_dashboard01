export const PAGE_SIZE = 8;

export const CHART_COLORS = {
  primary: ["#A9821F", "#3E6B8A", "#3E6B45"],
  status: {
    healthy: "#3E6B45",
    warning: "#A5652C",
    error: "#A23B27",
  },
  severity: {
    critical: "#A23B27",
    moderate: "#A5652C",
    low: "#3E6B8A",
  },
} as const;
