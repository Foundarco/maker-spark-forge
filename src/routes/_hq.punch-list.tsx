import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, JobCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const PRIORITY = { low: "border-border bg-muted/40 text-muted-foreground", medium: "border-blue-200 bg-blue-50 text-blue-700", high: "border-amber-200 bg-amber-50 text-amber-700", urgent: "border-red-200 bg-red-50 text-red-700" };
const STATUS = { open: "border-amber-200 bg-amber-50 text-amber-700", in_progress: "border-blue-200 bg-blue-50 text-blue-700", verified: "border-emerald-200 bg-emerald-50 text-emerald-700", closed: "border-border bg-muted/40 text-muted-foreground" };

const cfg: ResourceConfig<any> = {
  table: "con_punch_items",
  title: "Punch List",
  eyebrow: "Field Ops",
  icon: ListChecks,
  itemName: "punch item",
  noCreatedBy: true,
  orderBy: { column: "created_at", ascending: false },
  searchable: ["title", "location", "trade", "description"],
  kpis: (rows) => [
    { label: "Open", value: rows.filter((r) => r.status === "open").length, icon: ListChecks },
    { label: "In progress", value: rows.filter((r) => r.status === "in_progress").length, icon: ListChecks },
    { label: "Verified", value: rows.filter((r) => r.status === "verified").length, icon: ListChecks },
    { label: "Urgent", value: rows.filter((r) => r.priority === "urgent").length, icon: ListChecks },
  ],
  columns: [
    { key: "title", label: "Item", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "job_id", label: "Job", render: (r, c) => <JobCell jobId={r.job_id} jobs={c.jobs} /> },
    { key: "location", label: "Location" },
    { key: "trade", label: "Trade" },
    { key: "assignee_id", label: "Assignee", render: (r, c) => <UserCell userId={r.assignee_id} profiles={c.profiles} /> },
    { key: "due_date", label: "Due", render: (r) => <DateCell date={r.due_date} /> },
    { key: "priority", label: "Priority", render: (r) => <StatusBadge value={r.priority} palette={PRIORITY} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "title", label: "Item", type: "text", required: true, full: true },
    { key: "job_id", label: "Job", type: "job" },
    { key: "location", label: "Location", type: "text", placeholder: "Unit 204 / Kitchen" },
    { key: "trade", label: "Trade", type: "text" },
    { key: "assignee_id", label: "Assignee", type: "user" },
    { key: "due_date", label: "Due date", type: "date" },
    { key: "priority", label: "Priority", type: "select", options: ["low", "medium", "high", "urgent"].map((v) => ({ value: v, label: v })) },
    { key: "status", label: "Status", type: "select", options: ["open", "in_progress", "verified", "closed"].map((v) => ({ value: v, label: v })) },
    { key: "description", label: "Description", type: "textarea" },
  ],
  defaults: { status: "open", priority: "medium" },
};

export const Route = createFileRoute("/_hq/punch-list")({
  head: () => ({ meta: [{ title: "Punch List — McGuire HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
