import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban, Users, Calendar, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/_hq/projects")({
  head: () => ({ meta: [{ title: "Projects — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: ProjectsPage,
});

type Status = "on-track" | "at-risk" | "delayed" | "shipped";
type Project = {
  id: string;
  code: string;
  name: string;
  lead: string;
  team: number;
  progress: number;
  status: Status;
  phase: string;
  due: string;
  milestone: string;
  budget: number;
  spent: number;
};

const PROJECTS: Project[] = [
  { id: "P-01", code: "CLV-ONE-R2", name: "Clovr One · Revision 2", lead: "K. Chen", team: 8, progress: 72, status: "on-track", phase: "DVT", due: "Aug 14", milestone: "DVT build complete", budget: 240000, spent: 168000 },
  { id: "P-02", code: "CLV-PRO", name: "Clovr Pro · Enclosed Printer", lead: "J. Alvarez", team: 12, progress: 48, status: "at-risk", phase: "EVT", due: "Sep 30", milestone: "EVT sign-off", budget: 420000, spent: 231000 },
  { id: "P-03", code: "CLV-HOTEND-V4", name: "Hotend V4 · Direct Drive", lead: "M. Rossi", team: 4, progress: 88, status: "on-track", phase: "PVT", due: "Jul 28", milestone: "First production lot", budget: 85000, spent: 71400 },
  { id: "P-04", code: "CLV-FW-2.5", name: "Firmware 2.5 · Klipper Merge", lead: "S. Nguyen", team: 5, progress: 34, status: "delayed", phase: "Development", due: "Aug 05", milestone: "RC1", budget: 60000, spent: 32000 },
  { id: "P-05", code: "CLV-SLICER", name: "Clovr Slicer 1.0", lead: "R. Owens", team: 6, progress: 61, status: "on-track", phase: "Beta", due: "Sep 15", milestone: "Public beta", budget: 180000, spent: 96000 },
  { id: "P-06", code: "CLV-BED-HD", name: "Heated Bed · High-density", lead: "D. Patel", team: 3, progress: 100, status: "shipped", phase: "Released", due: "Jun 04", milestone: "Ramp complete", budget: 45000, spent: 41200 },
];

const STATUS_META: Record<Status, { label: string; classes: string; icon: any }> = {
  "on-track": { label: "On track", classes: "border-green-500/30 bg-green-500/10 text-green-500", icon: CheckCircle2 },
  "at-risk": { label: "At risk", classes: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500", icon: AlertCircle },
  "delayed": { label: "Delayed", classes: "border-destructive/30 bg-destructive/10 text-destructive", icon: Clock },
  "shipped": { label: "Shipped", classes: "border-blue-500/30 bg-blue-500/10 text-blue-500", icon: CheckCircle2 },
};

function ProjectsPage() {
  const total = PROJECTS.length;
  const onTrack = PROJECTS.filter((p) => p.status === "on-track").length;
  const atRisk = PROJECTS.filter((p) => p.status === "at-risk" || p.status === "delayed").length;
  const avgProgress = Math.round(PROJECTS.reduce((s, p) => s + p.progress, 0) / total);

  const kpis = [
    { label: "Active projects", value: total, icon: FolderKanban, hint: "Across engineering" },
    { label: "On track", value: onTrack, icon: CheckCircle2, hint: `${Math.round(onTrack / total * 100)}% healthy` },
    { label: "At risk", value: atRisk, icon: AlertCircle, hint: "Need attention" },
    { label: "Avg progress", value: `${avgProgress}%`, icon: TrendingUp, hint: "Weighted mean" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><FolderKanban className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Engineering · Projects</p>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
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
            <p className="mt-1 text-[11px] text-muted-foreground">{k.hint}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Phase</th>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Next milestone</th>
              <th className="px-4 py-3">Budget</th>
            </tr>
          </thead>
          <tbody>
            {PROJECTS.map((p) => {
              const meta = STATUS_META[p.status];
              const burn = Math.round((p.spent / p.budget) * 100);
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.code}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.phase}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{p.lead.charAt(0)}</div>
                      <span>{p.lead}</span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Users className="h-3 w-3" />{p.team}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-[11px] text-muted-foreground">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${meta.classes}`}>
                      <meta.icon className="h-3 w-3" /> {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs">{p.milestone}</p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><Calendar className="h-3 w-3" />{p.due}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs">${(p.spent / 1000).toFixed(0)}k / ${(p.budget / 1000).toFixed(0)}k</p>
                    <p className={`text-[11px] ${burn > 90 ? "text-destructive" : "text-muted-foreground"}`}>{burn}% burned</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
