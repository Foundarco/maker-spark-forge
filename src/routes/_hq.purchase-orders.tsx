import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { ResourcePage, StatusBadge, SupplierCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/purchase-orders")({
  head: () => ({ meta: [{ title: "Purchase Orders — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS = { draft: "border-muted-foreground/30 bg-muted/40 text-muted-foreground", submitted: "border-blue-500/30 bg-blue-500/10 text-blue-500", approved: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500", received: "border-green-500/30 bg-green-500/10 text-green-500", cancelled: "border-destructive/30 bg-destructive/10 text-destructive" };

const config: ResourceConfig<any> = {
  table: "mfg_purchase_orders",
  title: "Purchase Orders",
  eyebrow: "Fleet & Supply · Purchasing",
  icon: ShoppingCart,
  itemName: "purchase order",
  searchable: ["po_number", "notes"],
  orderBy: { column: "order_date", ascending: false },
  kpis: (rows) => {
    const total = rows.reduce((s, r) => s + Number(r.total || 0), 0);
    return [
      { label: "POs", value: rows.length, icon: ShoppingCart },
      { label: "Open", value: rows.filter((r) => ["submitted", "approved"].includes(r.status)).length, icon: ShoppingCart },
      { label: "Received", value: rows.filter((r) => r.status === "received").length, icon: ShoppingCart },
      { label: "Total value", value: `$${total.toFixed(0)}`, icon: ShoppingCart },
    ];
  },
  columns: [
    { key: "po_number", label: "PO #", render: (r) => <span className="font-mono text-xs">{r.po_number}</span> },
    { key: "supplier_id", label: "Supplier", render: (r, c) => <SupplierCell supplierId={r.supplier_id} suppliers={c.suppliers} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
    { key: "total", label: "Total", render: (r) => <span className="tabular-nums">${Number(r.total || 0).toFixed(2)}</span> },
    { key: "order_date", label: "Ordered", render: (r) => <DateCell date={r.order_date} /> },
    { key: "expected_date", label: "Expected", render: (r) => <DateCell date={r.expected_date} /> },
  ],
  fields: [
    { key: "po_number", label: "PO number", type: "text", required: true },
    { key: "supplier_id", label: "Supplier", type: "supplier" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "draft", label: "Draft" }, { value: "submitted", label: "Submitted" }, { value: "approved", label: "Approved" },
      { value: "received", label: "Received" }, { value: "cancelled", label: "Cancelled" },
    ] },
    { key: "total", label: "Total ($)", type: "number" },
    { key: "order_date", label: "Order date", type: "date" },
    { key: "expected_date", label: "Expected date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
  defaults: { status: "draft", total: 0 },
};
