import { createFileRoute } from "@tanstack/react-router";
import { Activity, ShieldCheck, Clock } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/diagnostics")({
  head: () => ({ meta: [{ title: "Remote Diagnostics — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS_PALETTE = {
  requested: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  awaiting_consent: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  completed: "border-border bg-muted/40 text-muted-foreground",
  cancelled: "border-destructive/40 bg-destructive/10 text-destructive",
};

// Reuses cs_repairs table with a "remote" tag to keep sessions distinct.
// Repair statuses map cleanly onto diagnostic sessions.
const config: ResourceConfig<any> = {
  table: "cs_repairs",
  title: "Remote Diagnostics",
  eyebrow: "Customer Service · Diagnostics",
  icon: Activity,
  itemName: "session",
  searchable: ["repair_number", "customer_name", "product_name", "serial_number"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => [
    { label: "Sessions", value: rows.length, icon: Activity },
    { label: "Awaiting consent", value: rows.filter((r) => r.status === "diagnosing").length, icon: ShieldCheck },
    { label: "Active", value: rows.filter((r) => r.status === "in_progress").length, icon: Clock },
    { label: "Completed", value: rows.filter((r) => r.status === "shipped" || r.status === "ready").length, icon: Activity },
  ],
  columns: [
    { key: "product_name", label: "Device", render: (r) => <div><div className="font-medium">{r.product_name}</div>{r.serial_number && <div className="text-xs font-mono text-muted-foreground">{r.serial_number}</div>}</div> },
    { key: "customer_name", label: "Customer", render: (r) => <div className="text-xs"><div>{r.customer_name || "—"}</div>{r.customer_email && <div className="text-muted-foreground">{r.customer_email}</div>}</div> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS_PALETTE} /> },
    { key: "technician_id", label: "Technician", render: (r, c) => <UserCell userId={r.technician_id} profiles={c.profiles} /> },
    { key: "created_at", label: "Requested", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "product_name", label: "Device / product", type: "text", required: true },
    { key: "serial_number", label: "Serial #", type: "text" },
    { key: "customer_name", label: "Customer name", type: "text" },
    { key: "customer_email", label: "Customer email", type: "text" },
    { key: "status", label: "Session status", type: "select", options: [
      { value: "intake", label: "Requested" }, { value: "diagnosing", label: "Awaiting customer consent" },
      { value: "in_progress", label: "Active" }, { value: "ready", label: "Completed" },
      { value: "shipped", label: "Closed" },
    ] },
    { key: "technician_id", label: "Technician", type: "user" },
    { key: "issue", label: "Reported issue", type: "textarea", full: true },
    { key: "notes", label: "Diagnostic notes / findings", type: "textarea", full: true },
  ],
  defaults: { status: "intake" },
};
