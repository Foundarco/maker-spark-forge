import { createFileRoute } from "@tanstack/react-router";
import { Undo2, DollarSign, CheckCircle2 } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/rma")({
  head: () => ({ meta: [{ title: "Returns (RMA) — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS_PALETTE = {
  requested: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  approved: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  received: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  refunded: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  denied: "border-destructive/40 bg-destructive/10 text-destructive",
};

const config: ResourceConfig<any> = {
  table: "cs_rmas",
  title: "Returns (RMA)",
  eyebrow: "Customer Service · Returns",
  icon: Undo2,
  itemName: "RMA",
  searchable: ["rma_number", "order_reference", "customer_name", "product_name"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => {
    const refunded = rows.filter((r) => r.status === "refunded");
    const totalRefund = refunded.reduce((s, r) => s + Number(r.refund_amount || 0), 0);
    return [
      { label: "Open RMAs", value: rows.filter((r) => !["refunded", "denied"].includes(r.status)).length, icon: Undo2 },
      { label: "Refunded", value: refunded.length, icon: CheckCircle2 },
      { label: "Refund $", value: `$${totalRefund.toFixed(0)}`, icon: DollarSign },
      { label: "Total", value: rows.length, icon: Undo2 },
    ];
  },
  columns: [
    { key: "rma_number", label: "RMA #", render: (r) => <span className="font-mono text-xs">{r.rma_number || r.id.slice(0, 8)}</span> },
    { key: "order_reference", label: "Order", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.order_reference || "—"}</span> },
    { key: "customer_name", label: "Customer", render: (r) => <div className="text-xs"><div>{r.customer_name || "—"}</div>{r.customer_email && <div className="text-muted-foreground">{r.customer_email}</div>}</div> },
    { key: "product_name", label: "Product" },
    { key: "reason", label: "Reason", render: (r) => <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{r.reason || "—"}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS_PALETTE} /> },
    { key: "refund_amount", label: "Refund", render: (r) => r.refund_amount != null ? `$${Number(r.refund_amount).toFixed(2)}` : "—" },
    { key: "created_at", label: "Opened", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "rma_number", label: "RMA #", type: "text" },
    { key: "order_reference", label: "Order reference", type: "text" },
    { key: "customer_name", label: "Customer name", type: "text" },
    { key: "customer_email", label: "Customer email", type: "text" },
    { key: "product_name", label: "Product", type: "text" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "requested", label: "Requested" }, { value: "approved", label: "Approved" },
      { value: "received", label: "Received" }, { value: "refunded", label: "Refunded" },
      { value: "denied", label: "Denied" },
    ] },
    { key: "refund_amount", label: "Refund amount ($)", type: "number" },
    { key: "received_at", label: "Received", type: "date" },
    { key: "resolved_at", label: "Resolved", type: "date" },
    { key: "reason", label: "Reason", type: "textarea", full: true },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
  defaults: { status: "requested" },
};
