import { createFileRoute } from "@tanstack/react-router";
import { Flag, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { ResourcePage, StatusBadge, ProjectCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/milestones")({
  head: () => ({ meta: [{ title: "Milestones — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS = { upcoming: "border-blue-500/30 bg-blue-500/10 text-blue-500", in_progress: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500", completed: "border-green-500/30 bg-green-500/10 text-green-500", missed: "border-destructive/30 bg-destructive/10 text-destructive" };

const config: ResourceConfig<any> = {
  table: "eng_milestones",
  title: "Milestones",
  eyebrow: "Engineering · Milestones",
  icon: Flag,
  itemName: "milestone",
  searchable: ["title", "description"],
  orderBy: { column: "due_date", ascending: true },
  kpis: (rows) => [
    { label: "Total", value: rows.length, icon: Flag },
    { label: "Upcoming", value: rows.filter((r) => r.status === "upcoming").length, icon: Clock },
    { label: "In progress", value: rows.filter((r) => r.status === "in_progress").length, icon: AlertCircle },
    { label: "Completed", value: rows.filter((r) => r.status === "completed").length, icon: CheckCircle2 },
  ],
  columns: [
    { key: "title", label: "Milestone", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "project_id", label: "Project", render: (r, c) => <ProjectCell projectId={r.project_id} projects={c.projects} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
    { key: "due_date", label: "Due", render: (r) => <DateCell date={r.due_date} /> },
  ],
  fields: [
    { key: "title", label: "Title", type: "text", required: true, full: true },
    { key: "project_id", label: "Project", type: "project" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "upcoming", label: "Upcoming" }, { value: "in_progress", label: "In progress" },
      { value: "completed", label: "Completed" }, { value: "missed", label: "Missed" },
    ] },
    { key: "due_date", label: "Due date", type: "date" },
    { key: "description", label: "Description", type: "textarea", full: true },
  ],
  defaults: { status: "upcoming" },
};
