import React, { useState, useEffect, useCallback } from "react";
import {
  Database, Home, Layers, CheckCircle2, AlertTriangle, XCircle,
  Cpu, MemoryStick, Activity, Clock, Bell, User, Sun, Moon,
} from "lucide-react";
import { Theme, Route } from "./types";
import { CANOPY, MEADOW } from "./styles/theme";
import { AmbientBackground } from "./components/layout";
import { renderPage, PageProps } from "./routes/AppRoutes";
import { ROUTES } from "./constants";
import { generateFleet, generateAlerts, generateIncidents } from "./services/mockData";

const NAV_ITEMS = [
  { key: ROUTES.HOME, label: "Overview", Icon: Home },
  { key: ROUTES.INVENTORY, label: "Inventory", Icon: Layers },
  { key: ROUTES.HEALTH, label: "Health", Icon: CheckCircle2 },
  { key: ROUTES.ALERTS, label: "Alerts", Icon: AlertTriangle },
  { key: ROUTES.INCIDENTS, label: "Incidents", Icon: XCircle },
  { key: ROUTES.CPU, label: "CPU", Icon: Cpu },
  { key: ROUTES.MEMORY, label: "Memory", Icon: MemoryStick },
  { key: ROUTES.CONNECTIONS, label: "Connections", Icon: Activity },
];

export default function App() {
  const [mode, setMode] = useState<"canopy" | "meadow">("canopy");
  const T: Theme = mode === "meadow" ? MEADOW : CANOPY;

  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [fleet, setFleet] = useState<ReturnType<typeof generateFleet>>([]);
  const [alerts, setAlerts] = useState<ReturnType<typeof generateAlerts>>([]);
  const [incidents, setIncidents] = useState<ReturnType<typeof generateIncidents>>([]);
  const [now, setNow] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [mouse, setMouse] = useState({ x: 400, y: 300 });
  const [range, setRange] = useState("7D");
  const [route, setRoute] = useState<Route>({ name: ROUTES.HOME });

  useEffect(() => {
    setPhase("loading");
    setTimeout(() => {
      const f = generateFleet();
      setFleet(f);
      setAlerts(generateAlerts(f));
      setIncidents(generateIncidents(f));
      setPhase("ready");
      setLastUpdated(new Date());
    }, 800);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      const f = generateFleet();
      setFleet(f);
      setAlerts(generateAlerts(f));
      setIncidents(generateIncidents(f));
      setRefreshing(false);
      setLastUpdated(new Date());
    }, 700);
  }, []);

  const go = useCallback((name: string, params: Record<string, unknown> = {}) => {
    setRoute({ name, ...params } as Route);
  }, []);

  const pageProps: PageProps = {
    T,
    phase,
    ready: phase === "ready",
    go,
    range,
    setRange,
    refreshing,
    handleRefresh,
  };

  const content = renderPage({ route, fleet, alerts, setAlerts, incidents, now, lastUpdated, ...pageProps });

  return (
    <div className="min-h-screen w-full relative">
      <AmbientBackground T={T} mouse={mouse} />
      <div className="relative z-10">
        <header
          className="sticky top-0 z-30"
          style={{
            background: T.headerBg,
            borderBottom: `1px solid ${mode === "canopy" ? "rgba(243,239,226,0.10)" : T.cardBorder}`,
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
            <button onClick={() => go(ROUTES.HOME)} className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primaryBg }}>
                <Database size={16} style={{ color: T.primary }} />
              </div>
              <span className="text-sm font-semibold truncate hidden sm:inline" style={{ color: T.bgInk, fontFamily: "'Fraunces', serif" }}>
                Database Monitoring Platform
              </span>
            </button>

            <nav className="hidden lg:flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: mode === "canopy" ? "rgba(243,239,226,0.06)" : T.surfaceMute }}>
              {NAV_ITEMS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => go(key)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                  style={{
                    background: route.name === key ? T.card : "transparent",
                    color: route.name === key ? T.ink : T.bgInkDim,
                    boxShadow: route.name === key ? "0 1px 2px rgba(20,30,20,0.1)" : "none",
                  }}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2.5 text-[11px] mr-1" style={{ color: T.bgInkFaint }}>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {lastUpdated.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <button
                onClick={() => setMode((m) => (m === "canopy" ? "meadow" : "canopy"))}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-150 hover:-translate-y-0.5"
                style={{
                  background: mode === "canopy" ? "rgba(243,239,226,0.08)" : T.card,
                  border: `1px solid ${mode === "canopy" ? "rgba(243,239,226,0.16)" : T.cardBorder}`,
                  color: mode === "canopy" ? T.bgInk : T.inkDim,
                }}
                title="Toggle theme"
              >
                {mode === "canopy" ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center relative transition-colors"
                style={{
                  background: mode === "canopy" ? "rgba(243,239,226,0.08)" : T.card,
                  border: `1px solid ${mode === "canopy" ? "rgba(243,239,226,0.16)" : T.cardBorder}`,
                  color: T.bgInkDim,
                }}
              >
                <Bell size={14} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: T.error }} />
              </button>

              <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.primaryBg, color: T.primary }}>
                <User size={14} />
              </button>
            </div>
          </div>

          <nav className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 pb-2.5">
            {NAV_ITEMS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => go(key)}
                className="px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors"
                style={{
                  background: route.name === key ? T.card : "transparent",
                  color: route.name === key ? T.ink : T.bgInkDim,
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </header>

        <main key={route.name + (route.id || "")} className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {content}
        </main>
      </div>
    </div>
  );
}
