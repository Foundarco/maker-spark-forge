import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/projects")({
  head: () => ({ meta: [{ title: "Projects — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS = { planning: "border-blue-500/30 bg-blue-500/10 text-blue-500", active: "border-green-500/30 bg-green-500/10 text-green-500", at_risk: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500", on_hold: "border-orange-500/30 bg-orange-500/10 text-orange-500", shipped: "border-primary/30 bg-primary/10 text-primary", cancelled: "border-destructive/30 bg-destructive/10 text-destructive" };

const config: ResourceConfig<any> = {
  table: "eng_projects",
  title: "Projects",
  eyebrow: "Engineering · Projects",
  icon: FolderKanban,
  itemName: "project",
  searchable: ["name", "code", "description"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => {
    const active = rows.filter((r) => r.status === "active" || r.status === "planning").length;
    const atRisk = rows.filter((r) => r.status === "at_risk" || r.status === "on_hold").length;
    const shipped = rows.filter((r) => r.status === "shipped").length;
    const avg = rows.length ? Math.round(rows.reduce((s, r) => s + (r.progress || 0), 0) / rows.length) : 0;
    return [
      { label: "Total", value: rows.length, icon: FolderKanban },
      { label: "Active", value: active, icon: CheckCircle2 },
      { label: "At risk", value: atRisk, icon: AlertCircle },
      { label: "Avg progress", value: `${avg}%`, icon: TrendingUp },
    ];
  },
  columns: [
    { key: "code", label: "Code", render: (r) => <span className="font-mono text-xs">{r.code || "—"}</span> },
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "lead_id", label: "Lead", render: (r, c) => <UserCell userId={r.lead_id} profiles={c.profiles} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
    { key: "progress", label: "Progress", render: (r) => (
      <div className="flex items-center gap-2 min-w-[140px]"><div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${r.progress ?? 0}%` }} /></div><span className="text-xs text-muted-foreground tabular-nums">{r.progress ?? 0}%</span></div>
    ) },
    { key: "target_date", label: "Target", render: (r) => <DateCell date={r.target_date} /> },
  ],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "code", label: "Code", type: "text", placeholder: "CLV-XXX" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "planning", label: "Planning" }, { value: "active", label: "Active" }, { value: "at_risk", label: "At risk" },
      { value: "on_hold", label: "On hold" }, { value: "shipped", label: "Shipped" }, { value: "cancelled", label: "Cancelled" },
    ] },
    { key: "lead_id", label: "Lead", type: "user" },
    { key: "start_date", label: "Start date", type: "date" },
    { key: "target_date", label: "Target date", type: "date" },
    { key: "progress", label: "Progress %", type: "number" },
    { key: "budget", label: "Budget ($)", type: "number" },
    { key: "spent", label: "Spent ($)", type: "number" },
    { key: "description", label: "Description", type: "textarea", full: true },
  ],
  defaults: { status: "planning", progress: 0, spent: 0 },
};
