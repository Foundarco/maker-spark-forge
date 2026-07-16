import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Factory, CheckCircle2, AlertTriangle, Pause, Zap, Gauge, Timer, TrendingUp, Wrench, PackageCheck } from "lucide-react";

export const Route = createFileRoute("/_hq/factory-live")({
  head: () => ({ meta: [{ title: "Assembly Floor — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: FactoryLive,
});

type StationStatus = "running" | "idle" | "maintenance" | "error";

type Station = {
  id: string;
  name: string;
  line: string;
  status: StationStatus;
  utilization: number;
  unitsToday: number;
  target: number;
  operator: string;
  wipModel: string;
};

// Printer assembly stations — a Clovr printer moves down these cells
const STATIONS: Station[] = [
  { id: "S-01", name: "Frame Sub-Assembly", line: "Line A", status: "running", utilization: 88, unitsToday: 24, target: 28, operator: "K. Chen", wipModel: "Clovr One" },
  { id: "S-02", name: "Motion & Rails", line: "Line A", status: "running", utilization: 91, unitsToday: 23, target: 28, operator: "J. Alvarez", wipModel: "Clovr One" },
  { id: "S-03", name: "Extruder & Hotend", line: "Line A", status: "running", utilization: 84, unitsToday: 22, target: 28, operator: "M. Rossi", wipModel: "Clovr One" },
  { id: "S-04", name: "Electronics & Wiring", line: "Line A", status: "maintenance", utilization: 0, unitsToday: 12, target: 28, operator: "—", wipModel: "Clovr One" },
  { id: "S-05", name: "Enclosure & Panels", line: "Line B", status: "running", utilization: 76, unitsToday: 18, target: 24, operator: "D. Patel", wipModel: "Clovr Pro" },
  { id: "S-06", name: "Firmware Flash", line: "Line B", status: "idle", utilization: 18, unitsToday: 14, target: 24, operator: "S. Nguyen", wipModel: "Clovr Pro" },
  { id: "S-07", name: "Calibration & Test Print", line: "QC", status: "running", utilization: 79, unitsToday: 21, target: 24, operator: "R. Owens", wipModel: "Mixed" },
  { id: "S-08", name: "Final QC & Pack-out", line: "Ship", status: "error", utilization: 0, unitsToday: 15, target: 24, operator: "L. Berger", wipModel: "Mixed" },
];

const STATUS_META: Record<StationStatus, { label: string; icon: any; color: string; dot: string }> = {
  running: { label: "Running", icon: CheckCircle2, color: "text-green-500 border-green-500/30 bg-green-500/10", dot: "bg-green-500" },
  idle: { label: "Idle", icon: Pause, color: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10", dot: "bg-yellow-500" },
  maintenance: { label: "Maintenance", icon: Wrench, color: "text-blue-500 border-blue-500/30 bg-blue-500/10", dot: "bg-blue-500" },
  error: { label: "Error", icon: AlertTriangle, color: "text-destructive border-destructive/30 bg-destructive/10", dot: "bg-destructive" },
};

function FactoryLive() {
  const [tick, setTick] = useState(0);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const t = setInterval(() => {
      setTick((v) => v + 1);
      setNow(new Date());
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const stations = STATIONS.map((s) => {
    if (s.status !== "running") return s;
    const jitter = ((tick * (parseInt(s.id.slice(2)) || 1)) % 7) - 3;
    return { ...s, utilization: Math.max(50, Math.min(99, s.utilization + jitter)) };
  });

  const running = stations.filter((s) => s.status === "running").length;
  const unitsBuilt = stations.filter((s) => s.id === "S-08")[0]?.unitsToday ?? 0;
  const totalTarget = stations.filter((s) => s.id === "S-08")[0]?.target ?? 0;
  const avgUtil = Math.round(stations.filter((s) => s.status === "running").reduce((sum, s) => sum + s.utilization, 0) / Math.max(1, running));
  const throughput = Math.round((unitsBuilt / Math.max(1, totalTarget)) * 100);

  const kpis = [
    { label: "Stations running", value: `${running}/${stations.length}`, icon: Factory, hint: "Live count" },
    { label: "Avg utilization", value: `${avgUtil}%`, icon: Gauge, hint: "Across running stations" },
    { label: "Printers built today", value: `${unitsBuilt}`, icon: PackageCheck, hint: `Target ${totalTarget} (final QC)` },
    { label: "Line throughput", value: `${throughput}%`, icon: TrendingUp, hint: "Built ÷ shift target" },
  ];

  const alerts = stations.filter((s) => s.status === "error" || s.status === "maintenance");

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Manufacturing · Assembly</p>
            <h1 className="text-3xl font-semibold tracking-tight">Assembly floor · Live</h1>
            <p className="text-sm text-muted-foreground">Every station where a Clovr printer is being built, in real time.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Live · updated {now.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{k.label}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-3xl font-semibold">{k.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>
            </div>
          );
        })}
      </div>

      {alerts.length > 0 && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-destructive">Attention</h2>
          </div>
          <ul className="space-y-2 text-sm">
            {alerts.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-lg bg-background/50 px-3 py-2">
                <span className="font-medium">{a.name} <span className="text-muted-foreground">· {a.line}</span></span>
                <span className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_META[a.status].color}`}>
                  {STATUS_META[a.status].label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Assembly stations</h2>
          </div>
          <p className="text-xs text-muted-foreground">Auto-refresh every 3s</p>
        </div>
        <div className="grid gap-px bg-border/50 sm:grid-cols-2 lg:grid-cols-4">
          {stations.map((s) => {
            const meta = STATUS_META[s.status];
            const pct = Math.min(100, Math.round((s.unitsToday / s.target) * 100));
            return (
              <div key={s.id} className="bg-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{s.line} · {s.id}</p>
                    <p className="font-semibold">{s.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Building: {s.wipModel}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] uppercase tracking-wider ${meta.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${s.status === "running" ? "animate-pulse" : ""}`} />
                    {meta.label}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Utilization</span>
                    <span className="font-semibold text-foreground">{s.utilization}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all ${s.status === "error" ? "bg-destructive" : s.status === "idle" ? "bg-yellow-500" : "bg-primary"}`}
                      style={{ width: `${s.utilization}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Units today</span>
                    <span className="font-semibold text-foreground">{s.unitsToday} / {s.target}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"><Timer className="h-3 w-3" /> Operator: {s.operator}</p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Sample data · connect real stations from Manufacturing → Machines & Maintenance to feed this dashboard.
      </p>
    </div>
  );
}
