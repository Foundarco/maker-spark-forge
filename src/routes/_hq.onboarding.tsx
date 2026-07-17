import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "hr_onboarding",
  title: "Onboarding",
  eyebrow: "HR",
  icon: ClipboardCheck,
  itemName: "task",
  orderBy: { column: "due_date", ascending: true },
  searchable: ["task", "category"],
  defaults: { status: "pending" },
  kpis: (rows) => [
    { label: "Tasks", value: rows.length, icon: ClipboardCheck },
    { label: "Pending", value: rows.filter((r) => r.status === "pending").length, icon: ClipboardCheck },
    { label: "Done", value: rows.filter((r) => r.status === "done").length, icon: ClipboardCheck },
  ],
  columns: [
    { key: "task", label: "Task", render: (r) => <span className="font-medium">{r.task}</span> },
    { key: "category", label: "Category", render: (r) => <StatusBadge value={r.category} /> },
    { key: "assignee_id", label: "Assignee", render: (r, ctx) => <UserCell userId={r.assignee_id} profiles={ctx.profiles} /> },
    { key: "due_date", label: "Due", render: (r) => <DateCell date={r.due_date} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={{ pending: "border-border bg-muted/40", in_progress: "border-blue-500/20 bg-blue-500/10 text-blue-600", done: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" }} /> },
  ],
  fields: [
    { key: "task", label: "Task", type: "text", required: true, full: true },
    { key: "category", label: "Category", type: "select", options: ["Paperwork","Equipment","Access","Training","Intro","Benefits"].map((v) => ({ value: v, label: v })) },
    { key: "assignee_id", label: "Assignee", type: "user" },
    { key: "due_date", label: "Due date", type: "date" },
    { key: "status", label: "Status", type: "select", options: [{ value: "pending", label: "Pending" }, { value: "in_progress", label: "In progress" }, { value: "done", label: "Done" }, { value: "blocked", label: "Blocked" }], required: true },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
