import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, Clock, AlertCircle, Zap, Filter, Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_hq/tasks")({
  head: () => ({ meta: [{ title: "Tasks & Boards — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: TasksPage,
});

type Priority = "low" | "med" | "high" | "urgent";
type Task = {
  id: string;
  title: string;
  project: string;
  assignee: string;
  priority: Priority;
  status: "backlog" | "todo" | "in-progress" | "review" | "done";
  points: number;
  due: string;
  tags: string[];
};

const TASKS: Task[] = [
  { id: "T-201", title: "Rework XY belt tensioner geometry", project: "CLV-ONE-R2", assignee: "K. Chen", priority: "high", status: "in-progress", points: 5, due: "Jul 22", tags: ["mechanical", "rev"] },
  { id: "T-202", title: "Hotend heat-creep regression test", project: "CLV-HOTEND-V4", assignee: "M. Rossi", priority: "high", status: "review", points: 3, due: "Jul 20", tags: ["thermals"] },
  { id: "T-203", title: "Klipper input-shaper auto-calibration", project: "CLV-FW-2.5", assignee: "S. Nguyen", priority: "urgent", status: "in-progress", points: 8, due: "Jul 25", tags: ["firmware"] },
  { id: "T-204", title: "Bed leveling routine — 25-point mesh", project: "CLV-PRO", assignee: "J. Alvarez", priority: "med", status: "todo", points: 5, due: "Aug 02", tags: ["motion"] },
  { id: "T-205", title: "Slicer: variable layer height v2", project: "CLV-SLICER", assignee: "R. Owens", priority: "med", status: "in-progress", points: 8, due: "Aug 12", tags: ["software"] },
  { id: "T-206", title: "Enclosure fan curve tuning", project: "CLV-PRO", assignee: "D. Patel", priority: "low", status: "backlog", points: 2, due: "Aug 18", tags: ["hardware"] },
  { id: "T-207", title: "USB-C PD negotiation intermittent fail", project: "CLV-ONE-R2", assignee: "K. Chen", priority: "urgent", status: "review", points: 3, due: "Jul 21", tags: ["electrical"] },
  { id: "T-208", title: "Update onboarding for auto-cal", project: "CLV-FW-2.5", assignee: "L. Berger", priority: "low", status: "done", points: 2, due: "Jul 18", tags: ["docs"] },
  { id: "T-209", title: "AC-input EMI filter re-layout", project: "CLV-PRO", assignee: "J. Alvarez", priority: "high", status: "todo", points: 5, due: "Aug 08", tags: ["electrical", "emc"] },
  { id: "T-210", title: "Ship-loose accessory kit BOM", project: "CLV-ONE-R2", assignee: "D. Patel", priority: "med", status: "todo", points: 3, due: "Aug 01", tags: ["logistics"] },
  { id: "T-211", title: "Filament runout sensor firmware", project: "CLV-FW-2.5", assignee: "S. Nguyen", priority: "med", status: "backlog", points: 3, due: "Aug 20", tags: ["firmware"] },
  { id: "T-212", title: "Print quality gate — reference cube", project: "CLV-HOTEND-V4", assignee: "M. Rossi", priority: "med", status: "done", points: 2, due: "Jul 15", tags: ["qa"] },
];

const COLUMNS: { key: Task["status"]; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "todo", label: "To do" },
  { key: "in-progress", label: "In progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

const PRIORITY_META: Record<Priority, string> = {
  low: "border-muted-foreground/30 bg-muted text-muted-foreground",
  med: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-500",
  urgent: "border-destructive/30 bg-destructive/10 text-destructive",
};

function TasksPage() {
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const projects = Array.from(new Set(TASKS.map((t) => t.project)));
  const filtered = projectFilter === "all" ? TASKS : TASKS.filter((t) => t.project === projectFilter);

  const kpis = [
    { label: "Open tasks", value: filtered.filter((t) => t.status !== "done").length, icon: CheckSquare },
    { label: "In progress", value: filtered.filter((t) => t.status === "in-progress").length, icon: Zap },
    { label: "Urgent / high", value: filtered.filter((t) => t.priority === "urgent" || t.priority === "high").length, icon: AlertCircle },
    { label: "Story points open", value: filtered.filter((t) => t.status !== "done").reduce((s, t) => s + t.points, 0), icon: Clock },
  ];

  return (
    <div className="mx-auto w-full max-w-[110rem] px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><CheckSquare className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Engineering · Boards</p>
            <h1 className="text-3xl font-semibold tracking-tight">Tasks &amp; Boards</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1.5 text-sm">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="bg-transparent text-xs outline-none">
              <option value="all">All projects</option>
              {projects.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"><Plus className="h-3 w-3" /> New task</button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</p>
              <k.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        {COLUMNS.map((col) => {
          const items = filtered.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="rounded-xl border border-border bg-card/60 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</p>
                <span className="rounded-full bg-muted px-2 text-[10px] text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((t) => (
                  <div key={t.id} className="rounded-lg border border-border bg-card p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium">{t.title}</p>
                      <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] uppercase ${PRIORITY_META[t.priority]}`}>{t.priority}</span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">{t.id} · {t.project}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {t.tags.map((tag) => (
                        <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">#{tag}</span>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">{t.assignee.charAt(0)}</span>
                        {t.assignee}
                      </span>
                      <span>{t.points} pt · {t.due}</span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <p className="py-4 text-center text-[11px] text-muted-foreground">Nothing here</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
