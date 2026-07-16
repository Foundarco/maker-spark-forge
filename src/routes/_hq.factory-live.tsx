import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Factory, CheckCircle2, AlertTriangle, Pause, Zap, Gauge, Boxes, Timer, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_hq/factory-live")({
  head: () => ({ meta: [{ title: "Live Factory — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: FactoryLive,
});

type MachineStatus = "running" | "idle" | "maintenance" | "error";

type Machine = {
  id: string;
  name: string;
  line: string;
  status: MachineStatus;
  utilization: number;
  outputToday: number;
  target: number;
  operator: string;
};

const MACHINES: Machine[] = [
  { id: "M-01", name: "Printer Farm A", line: "Line 1", status: "running", utilization: 92, outputToday: 148, target: 160, operator: "K. Chen" },
  { id: "M-02", name: "Printer Farm B", line: "Line 1", status: "running", utilization: 88, outputToday: 132, target: 160, operator: "J. Alvarez" },
  { id: "M-03", name: "Pellet Extruder 01", line: "Line 2", status: "running", utilization: 96, outputToday: 412, target: 420, operator: "M. Rossi" },
  { id: "M-04", name: "Pellet Extruder 02", line: "Line 2", status: "maintenance", utilization: 0, outputToday: 118, target: 420, operator: "—" },
  { id: "M-05", name: "CNC Mill 01", line: "Line 3", status: "running", utilization: 74, outputToday: 22, target: 28, operator: "D. Patel" },
  { id: "M-06", name: "Assembly Cell", line: "Line 3", status: "idle", utilization: 12, outputToday: 46, target: 80, operator: "S. Nguyen" },
  { id: "M-07", name: "QC Station 01", line: "QC", status: "running", utilization: 81, outputToday: 96, target: 120, operator: "R. Owens" },
  { id: "M-08", name: "Packaging Line", line: "Ship", status: "error", utilization: 0, outputToday: 34, target: 80, operator: "L. Berger" },
];

const STATUS_META: Record<MachineStatus, { label: string; icon: any; color: string; dot: string }> = {
  running: { label: "Running", icon: CheckCircle2, color: "text-green-500 border-green-500/30 bg-green-500/10", dot: "bg-green-500" },
  idle: { label: "Idle", icon: Pause, color: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10", dot: "bg-yellow-500" },
  maintenance: { label: "Maintenance", icon: Timer, color: "text-blue-500 border-blue-500/30 bg-blue-500/10", dot: "bg-blue-500" },
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

  // Simulate small live drift
  const machines = MACHINES.map((m) => {
    if (m.status !== "running") return m;
    const jitter = ((tick * (parseInt(m.id.slice(2)) || 1)) % 7) - 3;
    return { ...m, utilization: Math.max(50, Math.min(99, m.utilization + jitter)) };
  });

  const running = machines.filter((m) => m.status === "running").length;
  const totalOutput = machines.reduce((s, m) => s + m.outputToday, 0);
  const totalTarget = machines.reduce((s, m) => s + m.target, 0);
  const avgUtil = Math.round(machines.filter((m) => m.status === "running").reduce((s, m) => s + m.utilization, 0) / Math.max(1, running));
  const oee = Math.round((totalOutput / totalTarget) * 100);

  const kpis = [
    { label: "Machines running", value: `${running}/${machines.length}`, icon: Factory, hint: "Live count" },
    { label: "Avg utilization", value: `${avgUtil}%`, icon: Gauge, hint: "Across running machines" },
    { label: "Output today", value: `${totalOutput}`, icon: Boxes, hint: `Target ${totalTarget}` },
    { label: "OEE (approx.)", value: `${oee}%`, icon: TrendingUp, hint: "Output ÷ target" },
  ];

  const alerts = machines.filter((m) => m.status === "error" || m.status === "maintenance");

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Core · Live Factory</p>
            <h1 className="text-3xl font-semibold tracking-tight">Factory floor · Live</h1>
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
                <span className="font-medium">{a.name}</span>
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
            <h2 className="text-sm font-semibold uppercase tracking-wider">Machines</h2>
          </div>
          <p className="text-xs text-muted-foreground">Auto-refresh every 3s</p>
        </div>
        <div className="grid gap-px bg-border/50 sm:grid-cols-2 lg:grid-cols-4">
          {machines.map((m) => {
            const meta = STATUS_META[m.status];
            const pct = Math.min(100, Math.round((m.outputToday / m.target) * 100));
            return (
              <div key={m.id} className="bg-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{m.line} · {m.id}</p>
                    <p className="font-semibold">{m.name}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] uppercase tracking-wider ${meta.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${m.status === "running" ? "animate-pulse" : ""}`} />
                    {meta.label}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Utilization</span>
                    <span className="font-semibold text-foreground">{m.utilization}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all ${m.status === "error" ? "bg-destructive" : m.status === "idle" ? "bg-yellow-500" : "bg-primary"}`}
                      style={{ width: `${m.utilization}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Output</span>
                    <span className="font-semibold text-foreground">{m.outputToday} / {m.target}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Operator: {m.operator}</p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Sample data · connect real machines from Manufacturing → Machines to feed this dashboard.
      </p>
    </div>
  );
}
