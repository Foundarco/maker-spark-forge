import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STATUS = { pending: "border-amber-200 bg-amber-50 text-amber-700", in_progress: "border-blue-200 bg-blue-50 text-blue-700", complete: "border-emerald-200 bg-emerald-50 text-emerald-700" };

const cfg: ResourceConfig<any> = {
  table: "hr_onboarding",
  title: "Onboarding",
  eyebrow: "People",
  icon: GraduationCap,
  itemName: "onboarding task",
  orderBy: { column: "due_date", ascending: true },
  searchable: ["task", "category", "notes"],
  kpis: (rows) => [
    { label: "Open tasks", value: rows.filter((r) => r.status !== "complete").length, icon: GraduationCap },
    { label: "Complete", value: rows.filter((r) => r.status === "complete").length, icon: GraduationCap },
    { label: "Overdue", value: rows.filter((r) => r.status !== "complete" && r.due_date && new Date(r.due_date) < new Date()).length, icon: GraduationCap },
    { label: "New hires", value: new Set(rows.map((r) => r.employee_id).filter(Boolean)).size, icon: GraduationCap },
  ],
  columns: [
    { key: "task", label: "Task", render: (r) => <span className="font-medium">{r.task}</span> },
    { key: "category", label: "Category" },
    { key: "assignee_id", label: "Owner", render: (r, c) => <UserCell userId={r.assignee_id} profiles={c.profiles} /> },
    { key: "due_date", label: "Due", render: (r) => <DateCell date={r.due_date} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "task", label: "Task", type: "text", required: true, full: true },
    { key: "category", label: "Category", type: "select", options: ["Paperwork", "Safety", "Equipment", "Systems", "Site orientation", "Training"].map((v) => ({ value: v, label: v })) },
    { key: "assignee_id", label: "Owner", type: "user" },
    { key: "due_date", label: "Due date", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["pending", "in_progress", "complete"].map((v) => ({ value: v, label: v })) },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  defaults: { status: "pending" },
};

export const Route = createFileRoute("/_hq/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
