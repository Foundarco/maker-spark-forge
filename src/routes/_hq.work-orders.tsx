import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, ProjectCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/work-orders")({
  head: () => ({ meta: [{ title: "Work Orders — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS = { pending: "border-muted-foreground/30 bg-muted/40 text-muted-foreground", in_progress: "border-blue-500/30 bg-blue-500/10 text-blue-500", on_hold: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500", completed: "border-green-500/30 bg-green-500/10 text-green-500", cancelled: "border-destructive/30 bg-destructive/10 text-destructive" };
const PRIORITY = { low: "border-muted-foreground/30 bg-muted/40 text-muted-foreground", medium: "border-blue-500/30 bg-blue-500/10 text-blue-500", high: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500", urgent: "border-destructive/30 bg-destructive/10 text-destructive" };

const config: ResourceConfig<any> = {
  table: "mfg_work_orders",
  title: "Work Orders",
  eyebrow: "Manufacturing · Work Orders",
  icon: ClipboardList,
  itemName: "work order",
  searchable: ["order_number", "product_name", "notes"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => [
    { label: "Total", value: rows.length, icon: ClipboardList },
    { label: "In progress", value: rows.filter((r) => r.status === "in_progress").length, icon: Clock },
    { label: "On hold", value: rows.filter((r) => r.status === "on_hold").length, icon: AlertCircle },
    { label: "Completed", value: rows.filter((r) => r.status === "completed").length, icon: CheckCircle2 },
  ],
  columns: [
    { key: "order_number", label: "WO #", render: (r) => <span className="font-mono text-xs">{r.order_number}</span> },
    { key: "product_name", label: "Product", render: (r) => <span className="font-medium">{r.product_name}</span> },
    { key: "quantity", label: "Qty", render: (r) => <span className="tabular-nums">{r.quantity}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
    { key: "priority", label: "Priority", render: (r) => <StatusBadge value={r.priority} palette={PRIORITY} /> },
    { key: "project_id", label: "Project", render: (r, c) => <ProjectCell projectId={r.project_id} projects={c.projects} /> },
    { key: "assignee_id", label: "Operator", render: (r, c) => <UserCell userId={r.assignee_id} profiles={c.profiles} /> },
    { key: "due_date", label: "Due", render: (r) => <DateCell date={r.due_date} /> },
  ],
  fields: [
    { key: "order_number", label: "Order number", type: "text", required: true },
    { key: "product_name", label: "Product", type: "text", required: true },
    { key: "quantity", label: "Quantity", type: "number", required: true },
    { key: "status", label: "Status", type: "select", options: [
      { value: "pending", label: "Pending" }, { value: "in_progress", label: "In progress" },
      { value: "on_hold", label: "On hold" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" },
    ] },
    { key: "priority", label: "Priority", type: "select", options: [
      { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "urgent", label: "Urgent" },
    ] },
    { key: "project_id", label: "Project", type: "project" },
    { key: "assignee_id", label: "Operator", type: "user" },
    { key: "due_date", label: "Due date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
  defaults: { status: "pending", priority: "medium", quantity: 1 },
};
