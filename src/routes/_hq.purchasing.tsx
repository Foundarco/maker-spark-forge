import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag, DollarSign, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ResourcePage, StatusBadge, SupplierCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/purchasing")({
  head: () => ({ meta: [{ title: "Purchasing & Vendor Bills — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS_PALETTE = {
  open: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  approved: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  overdue: "border-destructive/40 bg-destructive/10 text-destructive",
  void: "border-border bg-muted/40 text-muted-foreground",
};

const config: ResourceConfig<any> = {
  table: "fin_bills",
  title: "Purchasing & Vendor Bills",
  eyebrow: "Finance · Accounts Payable",
  icon: ShoppingBag,
  itemName: "bill",
  searchable: ["bill_number", "supplier_name", "category"],
  orderBy: { column: "due_date", ascending: true },
  kpis: (rows) => {
    const now = Date.now();
    const open = rows.filter((r) => r.status === "open" || r.status === "approved" || r.status === "overdue");
    const openTotal = open.reduce((s, r) => s + Number(r.amount || 0), 0);
    const paid = rows.filter((r) => r.status === "paid");
    const paidTotal = paid.reduce((s, r) => s + Number(r.amount || 0), 0);
    const overdue = rows.filter((r) => r.status !== "paid" && r.status !== "void" && r.due_date && new Date(r.due_date).getTime() < now).length;
    return [
      { label: "Open $", value: `$${openTotal.toFixed(0)}`, icon: DollarSign, hint: `${open.length} bills` },
      { label: "Paid $", value: `$${paidTotal.toFixed(0)}`, icon: CheckCircle2, hint: `${paid.length} bills` },
      { label: "Overdue", value: overdue, icon: AlertTriangle },
      { label: "Total", value: rows.length, icon: ShoppingBag },
    ];
  },
  columns: [
    { key: "bill_number", label: "Bill #", render: (r) => <span className="font-mono text-xs">{r.bill_number || r.id.slice(0, 8)}</span> },
    { key: "supplier_id", label: "Supplier", render: (r, c) => r.supplier_id ? <SupplierCell supplierId={r.supplier_id} suppliers={c.suppliers} /> : <span className="text-sm">{r.supplier_name || "—"}</span> },
    { key: "category", label: "Category" },
    { key: "amount", label: "Amount", render: (r) => <span className="tabular-nums font-medium">${Number(r.amount).toFixed(2)}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS_PALETTE} /> },
    { key: "issue_date", label: "Issued", render: (r) => <DateCell date={r.issue_date} /> },
    { key: "due_date", label: "Due", render: (r) => <DateCell date={r.due_date} /> },
    { key: "paid_at", label: "Paid", render: (r) => <DateCell date={r.paid_at} /> },
  ],
  fields: [
    { key: "bill_number", label: "Bill / invoice #", type: "text" },
    { key: "supplier_id", label: "Supplier", type: "supplier" },
    { key: "supplier_name", label: "Supplier (freeform)", type: "text", placeholder: "If not in supplier list" },
    { key: "category", label: "Category", type: "text", placeholder: "COGS, SG&A, R&D..." },
    { key: "issue_date", label: "Issue date", type: "date" },
    { key: "due_date", label: "Due date", type: "date" },
    { key: "amount", label: "Amount ($)", type: "number", required: true },
    { key: "tax", label: "Tax ($)", type: "number" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "open", label: "Open" }, { value: "approved", label: "Approved" },
      { value: "paid", label: "Paid" }, { value: "overdue", label: "Overdue" },
      { value: "void", label: "Void" },
    ] },
    { key: "paid_at", label: "Paid at", type: "date" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
  defaults: { status: "open" },
};
