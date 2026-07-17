import { createFileRoute } from "@tanstack/react-router";
import { Wrench, PackageOpen, PackageCheck } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/repairs")({
  head: () => ({ meta: [{ title: "Repair Tracking — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS_PALETTE = {
  intake: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  diagnosing: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  in_progress: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  awaiting_parts: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  ready: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  shipped: "border-border bg-muted/40 text-muted-foreground",
};

const config: ResourceConfig<any> = {
  table: "cs_repairs",
  title: "Repair Tracking",
  eyebrow: "Customer Service · Repairs",
  icon: Wrench,
  itemName: "repair",
  searchable: ["repair_number", "customer_name", "product_name", "serial_number"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => [
    { label: "In shop", value: rows.filter((r) => !["shipped"].includes(r.status)).length, icon: Wrench },
    { label: "Intake", value: rows.filter((r) => r.status === "intake").length, icon: PackageOpen },
    { label: "Awaiting parts", value: rows.filter((r) => r.status === "awaiting_parts").length, icon: Wrench },
    { label: "Shipped back", value: rows.filter((r) => r.status === "shipped").length, icon: PackageCheck },
  ],
  columns: [
    { key: "repair_number", label: "#", render: (r) => <span className="font-mono text-xs">{r.repair_number || r.id.slice(0, 8)}</span> },
    { key: "product_name", label: "Product", render: (r) => <div><div className="font-medium">{r.product_name}</div>{r.serial_number && <div className="text-xs text-muted-foreground font-mono">{r.serial_number}</div>}</div> },
    { key: "customer_name", label: "Customer", render: (r) => <div className="text-xs"><div>{r.customer_name || "—"}</div>{r.customer_email && <div className="text-muted-foreground">{r.customer_email}</div>}</div> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS_PALETTE} /> },
    { key: "technician_id", label: "Technician", render: (r, c) => <UserCell userId={r.technician_id} profiles={c.profiles} /> },
    { key: "received_at", label: "Received", render: (r) => <DateCell date={r.received_at} /> },
    { key: "cost", label: "Cost", render: (r) => r.cost != null ? `$${Number(r.cost).toFixed(2)}` : "—" },
  ],
  fields: [
    { key: "repair_number", label: "Repair #", type: "text" },
    { key: "product_name", label: "Product", type: "text", required: true },
    { key: "serial_number", label: "Serial #", type: "text" },
    { key: "customer_name", label: "Customer name", type: "text" },
    { key: "customer_email", label: "Customer email", type: "text" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "intake", label: "Intake" }, { value: "diagnosing", label: "Diagnosing" },
      { value: "in_progress", label: "In progress" }, { value: "awaiting_parts", label: "Awaiting parts" },
      { value: "ready", label: "Ready to ship" }, { value: "shipped", label: "Shipped back" },
    ] },
    { key: "technician_id", label: "Technician", type: "user" },
    { key: "received_at", label: "Received", type: "date" },
    { key: "shipped_back_at", label: "Shipped back", type: "date" },
    { key: "cost", label: "Cost ($)", type: "number" },
    { key: "issue", label: "Reported issue", type: "textarea", full: true },
    { key: "notes", label: "Technician notes", type: "textarea", full: true },
  ],
  defaults: { status: "intake" },
};
