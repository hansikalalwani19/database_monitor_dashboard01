import { Theme } from "../types";

export function metricColor(value: number, T: Theme): string {
  if (value >= 85) return T.error;
  if (value >= 65) return T.warning;
  return T.success;
}

export function exportCSV<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: string; label: string }[],
  filename: string
): void {
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const body = rows
    .map((r) =>
      columns
        .map((c) =>
          `"${String(r[c.key] ?? "").replace(/"/g, '""')}"`
        )
        .join(",")
    )
    .join("\n");
  const blob = new Blob([header + "\n" + body], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
