import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, JobCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const PRIORITY = { low: "border-border bg-muted/40 text-muted-foreground", medium: "border-blue-200 bg-blue-50 text-blue-700", high: "border-amber-200 bg-amber-50 text-amber-700", urgent: "border-red-200 bg-red-50 text-red-700" };
const STATUS = { todo: "border-border bg-muted/40 text-muted-foreground", in_progress: "border-blue-200 bg-blue-50 text-blue-700", blocked: "border-red-200 bg-red-50 text-red-700", done: "border-emerald-200 bg-emerald-50 text-emerald-700" };

const cfg: ResourceConfig<any> = {
  table: "con_tasks",
  title: "Company Tasks",
  eyebrow: "Operations",
  icon: CheckSquare,
  itemName: "task",
  orderBy: { column: "created_at", ascending: false },
  searchable: ["title", "description", "department"],
  kpis: (rows) => [
    { label: "Open", value: rows.filter((r) => r.status !== "done").length, icon: CheckSquare },
    { label: "Blocked", value: rows.filter((r) => r.status === "blocked").length, icon: CheckSquare },
    { label: "Overdue", value: rows.filter((r) => r.status !== "done" && r.due_date && new Date(r.due_date) < new Date()).length, icon: CheckSquare },
    { label: "Done", value: rows.filter((r) => r.status === "done").length, icon: CheckSquare },
  ],
  columns: [
    { key: "title", label: "Task", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "department", label: "Department" },
    { key: "job_id", label: "Job", render: (r, c) => <JobCell jobId={r.job_id} jobs={c.jobs} /> },
    { key: "assignee_id", label: "Assignee", render: (r, c) => <UserCell userId={r.assignee_id} profiles={c.profiles} /> },
    { key: "due_date", label: "Due", render: (r) => <DateCell date={r.due_date} /> },
    { key: "priority", label: "Priority", render: (r) => <StatusBadge value={r.priority} palette={PRIORITY} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "title", label: "Task", type: "text", required: true, full: true },
    { key: "department", label: "Department", type: "select", options: ["Preconstruction", "Field Ops", "Materials", "Finance", "People", "Clients", "Operations"].map((v) => ({ value: v, label: v })) },
    { key: "job_id", label: "Related job", type: "job" },
    { key: "owner_id", label: "Owner", type: "user" },
    { key: "assignee_id", label: "Assignee", type: "user" },
    { key: "due_date", label: "Due date", type: "date" },
    { key: "priority", label: "Priority", type: "select", options: ["low", "medium", "high", "urgent"].map((v) => ({ value: v, label: v })) },
    { key: "status", label: "Status", type: "select", options: ["todo", "in_progress", "blocked", "done"].map((v) => ({ value: v, label: v })) },
    { key: "blocked_reason", label: "Blocked reason", type: "text", full: true },
    { key: "description", label: "Description", type: "textarea" },
  ],
  defaults: { status: "todo", priority: "medium" },
};

export const Route = createFileRoute("/_hq/company-tasks")({
  head: () => ({ meta: [{ title: "Company Tasks — McGuire HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
