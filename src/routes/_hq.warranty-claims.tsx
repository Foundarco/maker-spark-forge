import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/warranty-claims")({
  head: () => ({ meta: [{ title: "Warranty Claims — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS_PALETTE = {
  submitted: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  reviewing: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  denied: "border-destructive/40 bg-destructive/10 text-destructive",
  fulfilled: "border-border bg-muted/40 text-muted-foreground",
};

const config: ResourceConfig<any> = {
  table: "cs_warranty_claims",
  title: "Warranty Claims",
  eyebrow: "Research & Partners · Warranty",
  icon: ShieldCheck,
  itemName: "claim",
  searchable: ["claim_number", "customer_name", "product_name", "serial_number"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => [
    { label: "Total", value: rows.length, icon: ShieldCheck },
    { label: "Reviewing", value: rows.filter((r) => r.status === "reviewing" || r.status === "submitted").length, icon: Clock },
    { label: "Approved", value: rows.filter((r) => r.status === "approved" || r.status === "fulfilled").length, icon: CheckCircle2 },
    { label: "Denied", value: rows.filter((r) => r.status === "denied").length, icon: XCircle },
  ],
  columns: [
    { key: "claim_number", label: "Claim #", render: (r) => <span className="font-mono text-xs">{r.claim_number || r.id.slice(0, 8)}</span> },
    { key: "product_name", label: "Product", render: (r) => <div><div className="font-medium">{r.product_name}</div>{r.serial_number && <div className="text-xs text-muted-foreground font-mono">{r.serial_number}</div>}</div> },
    { key: "customer_name", label: "Customer", render: (r) => <div className="text-xs"><div>{r.customer_name || "—"}</div>{r.customer_email && <div className="text-muted-foreground">{r.customer_email}</div>}</div> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS_PALETTE} /> },
    { key: "assignee_id", label: "Reviewer", render: (r, c) => <UserCell userId={r.assignee_id} profiles={c.profiles} /> },
    { key: "purchase_date", label: "Purchased", render: (r) => <DateCell date={r.purchase_date} /> },
    { key: "created_at", label: "Submitted", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "claim_number", label: "Claim #", type: "text" },
    { key: "product_name", label: "Product", type: "text", required: true },
    { key: "serial_number", label: "Serial #", type: "text" },
    { key: "customer_name", label: "Customer name", type: "text" },
    { key: "customer_email", label: "Customer email", type: "text" },
    { key: "purchase_date", label: "Purchase date", type: "date" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "submitted", label: "Submitted" }, { value: "reviewing", label: "Reviewing" },
      { value: "approved", label: "Approved" }, { value: "denied", label: "Denied" },
      { value: "fulfilled", label: "Fulfilled" },
    ] },
    { key: "assignee_id", label: "Reviewer", type: "user" },
    { key: "resolved_at", label: "Resolved", type: "date" },
    { key: "issue", label: "Reported issue", type: "textarea", full: true },
    { key: "resolution", label: "Resolution", type: "textarea", full: true },
    { key: "notes", label: "Internal notes", type: "textarea", full: true },
  ],
  defaults: { status: "submitted" },
};
