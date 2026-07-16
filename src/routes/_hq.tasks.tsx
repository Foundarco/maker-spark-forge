import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, ProjectCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS = { todo: "border-muted-foreground/30 bg-muted/40 text-muted-foreground", in_progress: "border-blue-500/30 bg-blue-500/10 text-blue-500", review: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500", done: "border-green-500/30 bg-green-500/10 text-green-500", blocked: "border-destructive/30 bg-destructive/10 text-destructive" };
const PRIORITY = { low: "border-muted-foreground/30 bg-muted/40 text-muted-foreground", medium: "border-blue-500/30 bg-blue-500/10 text-blue-500", high: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500", urgent: "border-destructive/30 bg-destructive/10 text-destructive" };

const config: ResourceConfig<any> = {
  table: "eng_tasks",
  title: "Tasks & Boards",
  eyebrow: "Engineering · Tasks",
  icon: CheckSquare,
  itemName: "task",
  searchable: ["title", "description"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => [
    { label: "Total", value: rows.length, icon: CheckSquare },
    { label: "In progress", value: rows.filter((r) => r.status === "in_progress").length, icon: Clock },
    { label: "Blocked", value: rows.filter((r) => r.status === "blocked").length, icon: AlertCircle },
    { label: "Done", value: rows.filter((r) => r.status === "done").length, icon: CheckCircle2 },
  ],
  columns: [
    { key: "title", label: "Task", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "project_id", label: "Project", render: (r, c) => <ProjectCell projectId={r.project_id} projects={c.projects} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
    { key: "priority", label: "Priority", render: (r) => <StatusBadge value={r.priority} palette={PRIORITY} /> },
    { key: "assignee_id", label: "Assignee", render: (r, c) => <UserCell userId={r.assignee_id} profiles={c.profiles} /> },
    { key: "due_date", label: "Due", render: (r) => <DateCell date={r.due_date} /> },
  ],
  fields: [
    { key: "title", label: "Title", type: "text", required: true, full: true },
    { key: "project_id", label: "Project", type: "project" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "todo", label: "To do" }, { value: "in_progress", label: "In progress" },
      { value: "review", label: "Review" }, { value: "done", label: "Done" }, { value: "blocked", label: "Blocked" },
    ] },
    { key: "priority", label: "Priority", type: "select", options: [
      { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "urgent", label: "Urgent" },
    ] },
    { key: "assignee_id", label: "Assignee", type: "user" },
    { key: "due_date", label: "Due date", type: "date" },
    { key: "tags", label: "Tags (comma-separated)", type: "tags", full: true },
    { key: "description", label: "Description", type: "textarea", full: true },
  ],
  defaults: { status: "todo", priority: "medium", tags: [] },
};
