import { createFileRoute } from "@tanstack/react-router";
import { Receipt, DollarSign, Truck, CheckCircle2 } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/orders")({
  head: () => ({ meta: [{ title: "Orders — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS_PALETTE = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  paid: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  fulfilled: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  shipped: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  cancelled: "border-destructive/40 bg-destructive/10 text-destructive",
  refunded: "border-border bg-muted/40 text-muted-foreground",
};

const config: ResourceConfig<any> = {
  table: "sales_orders",
  title: "Orders",
  eyebrow: "Sales · Orders",
  icon: Receipt,
  itemName: "order",
  searchable: ["order_number", "customer_name", "customer_email"],
  orderBy: { column: "ordered_at", ascending: false },
  kpis: (rows) => {
    const revenue = rows.filter((r) => r.status !== "cancelled" && r.status !== "refunded").reduce((s, r) => s + Number(r.total || 0), 0);
    return [
      { label: "Orders", value: rows.length, icon: Receipt },
      { label: "Revenue", value: `$${revenue.toFixed(0)}`, icon: DollarSign },
      { label: "Shipped", value: rows.filter((r) => r.status === "shipped" || r.status === "fulfilled").length, icon: Truck },
      { label: "Fulfilled", value: rows.filter((r) => r.status === "fulfilled").length, icon: CheckCircle2 },
    ];
  },
  columns: [
    { key: "order_number", label: "Order #", render: (r) => <span className="font-mono text-xs">{r.order_number || r.id.slice(0, 8)}</span> },
    { key: "customer_name", label: "Customer", render: (r) => <div className="text-xs"><div className="font-medium">{r.customer_name}</div>{r.customer_email && <div className="text-muted-foreground">{r.customer_email}</div>}</div> },
    { key: "items_count", label: "Items", render: (r) => <span className="tabular-nums text-xs">{r.items_count ?? "—"}</span> },
    { key: "total", label: "Total", render: (r) => r.total != null ? <span className="tabular-nums font-medium">${Number(r.total).toFixed(2)}</span> : "—" },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS_PALETTE} /> },
    { key: "ordered_at", label: "Ordered", render: (r) => <DateCell date={r.ordered_at} /> },
    { key: "shipped_at", label: "Shipped", render: (r) => <DateCell date={r.shipped_at} /> },
    { key: "owner_id", label: "Rep", render: (r, c) => <UserCell userId={r.owner_id} profiles={c.profiles} /> },
  ],
  fields: [
    { key: "order_number", label: "Order #", type: "text" },
    { key: "customer_name", label: "Customer", type: "text", required: true },
    { key: "customer_email", label: "Customer email", type: "text" },
    { key: "items_count", label: "# items", type: "number" },
    { key: "subtotal", label: "Subtotal ($)", type: "number" },
    { key: "tax", label: "Tax ($)", type: "number" },
    { key: "total", label: "Total ($)", type: "number", required: true },
    { key: "status", label: "Status", type: "select", options: [
      { value: "pending", label: "Pending" }, { value: "paid", label: "Paid" },
      { value: "fulfilled", label: "Fulfilled" }, { value: "shipped", label: "Shipped" },
      { value: "cancelled", label: "Cancelled" }, { value: "refunded", label: "Refunded" },
    ] },
    { key: "ordered_at", label: "Order date", type: "date" },
    { key: "shipped_at", label: "Ship date", type: "date" },
    { key: "owner_id", label: "Sales rep", type: "user" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
  defaults: { status: "pending", items_count: 1 },
};
