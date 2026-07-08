import React from "react";
import { Theme, Database, Alert, Incident } from "../types";
import { Dashboard } from "../pages/Dashboard";
import { Inventory } from "../pages/Inventory";
import { Health } from "../pages/Health";
import { Alerts } from "../pages/Alerts";
import { Incidents } from "../pages/Incidents";
import { CPU, Memory, Connections } from "../pages/Analytics";
import { DatabaseDetails } from "../pages/DatabaseDetails";

export interface PageProps {
  T: Theme;
  phase: "loading" | "ready" | "error";
  ready: boolean;
  go: (name: string, params?: Record<string, unknown>) => void;
  range: string;
  setRange: (v: string) => void;
  refreshing: boolean;
  handleRefresh: () => void;
}

export interface Route {
  name: string;
  id?: string;
  from?: string;
}

interface RenderPageParams extends PageProps {
  route: Route;
  fleet: Database[];
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  incidents: Incident[];
  now: Date;
  lastUpdated: Date;
}

export function renderPage({
  route,
  T,
  fleet,
  alerts,
  setAlerts,
  incidents,
  now,
  lastUpdated,
  ...pageProps
}: RenderPageParams): React.ReactNode {
  switch (route.name) {
    case "home":
      return <Dashboard {...pageProps} T={T} fleet={fleet} now={now} lastUpdated={lastUpdated} />;
    case "inventory":
      return <Inventory {...pageProps} T={T} fleet={fleet} />;
    case "health":
      return <Health {...pageProps} T={T} fleet={fleet} />;
    case "alerts":
      return <Alerts {...pageProps} T={T} fleet={fleet} alerts={alerts} setAlerts={setAlerts} />;
    case "incidents":
      return <Incidents {...pageProps} T={T} fleet={fleet} incidents={incidents} />;
    case "cpu":
      return <CPU {...pageProps} T={T} fleet={fleet} />;
    case "memory":
      return <Memory {...pageProps} T={T} fleet={fleet} />;
    case "connections":
      return <Connections {...pageProps} T={T} fleet={fleet} />;
    case "detail":
      return (
        <DatabaseDetails
          T={T}
          db={fleet.find((d) => d.id === route.id)}
          from={route.from || "home"}
          go={pageProps.go}
        />
      );
    default:
      return <Dashboard {...pageProps} T={T} fleet={fleet} now={now} lastUpdated={lastUpdated} />;
  }
}
