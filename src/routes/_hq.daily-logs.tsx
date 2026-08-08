import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, JobCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STATUS = { draft: "border-border bg-muted/40 text-muted-foreground", submitted: "border-emerald-200 bg-emerald-50 text-emerald-700" };

const cfg: ResourceConfig<any> = {
  table: "con_daily_logs",
  title: "Daily Logs",
  eyebrow: "Field Ops",
  icon: ClipboardList,
  itemName: "daily log",
  noCreatedBy: true,
  orderBy: { column: "log_date", ascending: false },
  searchable: ["work_performed", "weather", "delays", "visitors"],
  kpis: (rows) => [
    { label: "Logs", value: rows.length, icon: ClipboardList },
    { label: "Field hours", value: rows.reduce((s, r) => s + Number(r.hours_worked || 0), 0).toLocaleString(), icon: ClipboardList },
    { label: "Days with delays", value: rows.filter((r) => r.delays).length, icon: ClipboardList },
    { label: "Drafts", value: rows.filter((r) => r.status !== "submitted").length, icon: ClipboardList },
  ],
  columns: [
    { key: "log_date", label: "Date", render: (r) => <DateCell date={r.log_date} /> },
    { key: "job_id", label: "Job", render: (r, c) => <JobCell jobId={r.job_id} jobs={c.jobs} /> },
    { key: "crew_count", label: "Crew", render: (r) => <span className="font-mono text-xs">{r.crew_count ?? 0}</span> },
    { key: "hours_worked", label: "Hours", render: (r) => <span className="font-mono text-xs">{Number(r.hours_worked || 0)}</span> },
    { key: "weather", label: "Weather", render: (r) => <span className="text-xs text-muted-foreground">{[r.weather, r.temperature].filter(Boolean).join(" · ") || "—"}</span> },
    { key: "submitted_by", label: "Submitted by", render: (r, c) => <UserCell userId={r.submitted_by} profiles={c.profiles} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "job_id", label: "Job", type: "job", required: true },
    { key: "log_date", label: "Date", type: "date", required: true },
    { key: "weather", label: "Weather", type: "select", options: ["Clear", "Cloudy", "Rain", "Snow", "Wind", "Extreme heat"].map((v) => ({ value: v, label: v })) },
    { key: "temperature", label: "Temperature", type: "text", placeholder: "62F" },
    { key: "crew_count", label: "Crew on site", type: "number" },
    { key: "hours_worked", label: "Hours worked", type: "number" },
    { key: "submitted_by", label: "Submitted by", type: "user" },
    { key: "status", label: "Status", type: "select", options: ["draft", "submitted"].map((v) => ({ value: v, label: v })) },
    { key: "work_performed", label: "Work performed", type: "textarea" },
    { key: "delays", label: "Delays / issues", type: "textarea" },
    { key: "materials_received", label: "Materials received", type: "textarea" },
    { key: "visitors", label: "Visitors / inspections", type: "textarea" },
  ],
  defaults: { status: "draft" },
};

export const Route = createFileRoute("/_hq/daily-logs")({
  head: () => ({ meta: [{ title: "Daily Logs — McGuire HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
