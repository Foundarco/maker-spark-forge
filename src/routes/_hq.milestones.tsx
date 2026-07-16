import { createFileRoute } from "@tanstack/react-router";
import { Flag, CheckCircle2, Clock, AlertCircle, Calendar } from "lucide-react";

export const Route = createFileRoute("/_hq/milestones")({
  head: () => ({ meta: [{ title: "Milestones — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: MilestonesPage,
});

type Milestone = {
  id: string;
  name: string;
  project: string;
  date: string;
  status: "done" | "in-progress" | "upcoming" | "at-risk";
  owner: string;
  completion: number;
  deliverables: string[];
};

const MILESTONES: Milestone[] = [
  { id: "M-01", name: "EVT-1 Build (10 units)", project: "CLV-PRO", date: "2026-06-14", status: "done", owner: "J. Alvarez", completion: 100, deliverables: ["EVT drawing pack", "PCBA rev C", "Test report"] },
  { id: "M-02", name: "Firmware 2.5 · RC1", project: "CLV-FW-2.5", date: "2026-08-05", status: "at-risk", owner: "S. Nguyen", completion: 34, deliverables: ["Klipper merge", "Input shaping GA", "OTA channel"] },
  { id: "M-03", name: "Hotend V4 · PVT release", project: "CLV-HOTEND-V4", date: "2026-07-28", status: "in-progress", owner: "M. Rossi", completion: 88, deliverables: ["Tool release", "10k-hr burn-in", "Supplier PPAP"] },
  { id: "M-04", name: "DVT sign-off", project: "CLV-ONE-R2", date: "2026-08-14", status: "in-progress", owner: "K. Chen", completion: 72, deliverables: ["ID freeze", "Reg pre-scan", "50-unit build"] },
  { id: "M-05", name: "Slicer 1.0 public beta", project: "CLV-SLICER", date: "2026-09-15", status: "upcoming", owner: "R. Owens", completion: 61, deliverables: ["Cross-platform installers", "Cloud sync", "Profile library"] },
  { id: "M-06", name: "EVT-2 · Enclosed variant", project: "CLV-PRO", date: "2026-09-30", status: "at-risk", owner: "J. Alvarez", completion: 48, deliverables: ["HEPA carbon module", "Chamber sensing", "Door interlock"] },
  { id: "M-07", name: "Regulatory scan (FCC/CE)", project: "CLV-ONE-R2", date: "2026-10-10", status: "upcoming", owner: "D. Patel", completion: 12, deliverables: ["Pre-scan", "Corrective actions", "Formal cert"] },
  { id: "M-08", name: "Ramp to 200/wk", project: "CLV-ONE-R2", date: "2026-11-20", status: "upcoming", owner: "K. Chen", completion: 0, deliverables: ["Line B live", "SOP v2", "Vendor dual-source"] },
];

const STATUS_META = {
  done: { classes: "border-green-500/30 bg-green-500/10 text-green-500", icon: CheckCircle2, label: "Done" },
  "in-progress": { classes: "border-blue-500/30 bg-blue-500/10 text-blue-500", icon: Clock, label: "In progress" },
  "at-risk": { classes: "border-destructive/30 bg-destructive/10 text-destructive", icon: AlertCircle, label: "At risk" },
  upcoming: { classes: "border-muted-foreground/30 bg-muted text-muted-foreground", icon: Calendar, label: "Upcoming" },
} as const;

function MilestonesPage() {
  const sorted = [...MILESTONES].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Flag className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Engineering · Milestones</p>
          <h1 className="text-3xl font-semibold tracking-tight">Milestones</h1>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-3">
        {(["done", "in-progress", "at-risk", "upcoming"] as const).map((s) => {
          const count = MILESTONES.filter((m) => m.status === s).length;
          const meta = STATUS_META[s];
          return (
            <div key={s} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{meta.label}</p>
                <meta.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="relative">
        <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />
        <div className="space-y-3">
          {sorted.map((m) => {
            const meta = STATUS_META[m.status];
            const d = new Date(m.date + "T12:00:00");
            return (
              <div key={m.id} className="relative pl-10">
                <div className={`absolute left-1.5 top-4 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card ${m.status === "done" ? "bg-green-500" : m.status === "at-risk" ? "bg-destructive" : m.status === "in-progress" ? "bg-blue-500" : "bg-muted-foreground"}`} />
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{m.project} · {m.id}</p>
                      <p className="mt-0.5 font-semibold">{m.name}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })} · Owner: {m.owner}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${meta.classes}`}>
                      <meta.icon className="h-3 w-3" /> {meta.label}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${m.completion}%` }} />
                    </div>
                    <span className="text-[11px] text-muted-foreground">{m.completion}%</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {m.deliverables.map((d) => (
                      <span key={d} className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px]">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
