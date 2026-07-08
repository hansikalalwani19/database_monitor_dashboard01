import React from "react";

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div style={{ animation: "pageIn 0.35s ease-out" }}>{children}</div>;
}
