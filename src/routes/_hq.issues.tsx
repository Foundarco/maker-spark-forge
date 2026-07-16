import { createFileRoute } from "@tanstack/react-router";
import { Bug, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, ProjectCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/issues")({
  head: () => ({ meta: [{ title: "Issues — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS = { open: "border-destructive/30 bg-destructive/10 text-destructive", in_progress: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500", resolved: "border-green-500/30 bg-green-500/10 text-green-500", closed: "border-muted-foreground/30 bg-muted/40 text-muted-foreground" };
const SEV = { low: "border-muted-foreground/30 bg-muted/40 text-muted-foreground", medium: "border-blue-500/30 bg-blue-500/10 text-blue-500", high: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500", critical: "border-destructive/30 bg-destructive/10 text-destructive" };

const config: ResourceConfig<any> = {
  table: "eng_issues",
  title: "Issues",
  eyebrow: "Engineering · Issues",
  icon: Bug,
  itemName: "issue",
  searchable: ["title", "description", "category"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => [
    { label: "Total", value: rows.length, icon: Bug },
    { label: "Open", value: rows.filter((r) => r.status === "open").length, icon: AlertCircle },
    { label: "In progress", value: rows.filter((r) => r.status === "in_progress").length, icon: Clock },
    { label: "Resolved", value: rows.filter((r) => r.status === "resolved").length, icon: CheckCircle2 },
  ],
  columns: [
    { key: "title", label: "Issue", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "category", label: "Category" },
    { key: "severity", label: "Severity", render: (r) => <StatusBadge value={r.severity} palette={SEV} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
    { key: "project_id", label: "Project", render: (r, c) => <ProjectCell projectId={r.project_id} projects={c.projects} /> },
    { key: "assignee_id", label: "Assignee", render: (r, c) => <UserCell userId={r.assignee_id} profiles={c.profiles} /> },
  ],
  fields: [
    { key: "title", label: "Title", type: "text", required: true, full: true },
    { key: "category", label: "Category", type: "text", placeholder: "Hardware, Firmware, Software..." },
    { key: "severity", label: "Severity", type: "select", options: [
      { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "critical", label: "Critical" },
    ] },
    { key: "status", label: "Status", type: "select", options: [
      { value: "open", label: "Open" }, { value: "in_progress", label: "In progress" },
      { value: "resolved", label: "Resolved" }, { value: "closed", label: "Closed" },
    ] },
    { key: "project_id", label: "Project", type: "project" },
    { key: "assignee_id", label: "Assignee", type: "user" },
    { key: "reporter_id", label: "Reporter", type: "user" },
    { key: "description", label: "Description", type: "textarea", full: true },
  ],
  defaults: { status: "open", severity: "medium" },
};
