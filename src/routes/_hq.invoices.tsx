import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/invoices")({
  head: () => ({ meta: [{ title: "Invoices & Payments — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS_PALETTE = {
  draft: "border-border bg-muted/40 text-muted-foreground",
  sent: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  overdue: "border-destructive/40 bg-destructive/10 text-destructive",
  void: "border-border bg-muted/40 text-muted-foreground",
};

const config: ResourceConfig<any> = {
  table: "fin_invoices",
  title: "Invoices & Payments",
  eyebrow: "Finance · Accounts Receivable",
  icon: FileSpreadsheet,
  itemName: "invoice",
  searchable: ["invoice_number", "customer_name", "customer_email"],
  orderBy: { column: "issue_date", ascending: false },
  kpis: (rows) => {
    const now = Date.now();
    const outstanding = rows.filter((r) => r.status === "sent" || r.status === "overdue");
    const outstandingTotal = outstanding.reduce((s, r) => s + Number(r.total || 0), 0);
    const paid = rows.filter((r) => r.status === "paid");
    const paidTotal = paid.reduce((s, r) => s + Number(r.total || 0), 0);
    const overdue = rows.filter((r) => r.status !== "paid" && r.status !== "void" && r.due_date && new Date(r.due_date).getTime() < now).length;
    return [
      { label: "Outstanding", value: `$${outstandingTotal.toFixed(0)}`, icon: Clock, hint: `${outstanding.length} invoices` },
      { label: "Paid", value: `$${paidTotal.toFixed(0)}`, icon: DollarSign, hint: `${paid.length} invoices` },
      { label: "Overdue", value: overdue, icon: AlertTriangle },
      { label: "Total", value: rows.length, icon: FileSpreadsheet },
    ];
  },
  columns: [
    { key: "invoice_number", label: "#", render: (r) => <span className="font-mono text-xs">{r.invoice_number || r.id.slice(0, 8)}</span> },
    { key: "customer_name", label: "Customer", render: (r) => <div className="text-xs"><div className="font-medium">{r.customer_name}</div>{r.customer_email && <div className="text-muted-foreground">{r.customer_email}</div>}</div> },
    { key: "total", label: "Total", render: (r) => r.total != null ? <span className="tabular-nums font-medium">${Number(r.total).toFixed(2)}</span> : "—" },
    { key: "tax", label: "Tax", render: (r) => r.tax != null ? <span className="tabular-nums text-xs text-muted-foreground">${Number(r.tax).toFixed(2)}</span> : "—" },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS_PALETTE} /> },
    { key: "issue_date", label: "Issued", render: (r) => <DateCell date={r.issue_date} /> },
    { key: "due_date", label: "Due", render: (r) => <DateCell date={r.due_date} /> },
    { key: "paid_at", label: "Paid", render: (r) => <DateCell date={r.paid_at} /> },
  ],
  fields: [
    { key: "invoice_number", label: "Invoice #", type: "text" },
    { key: "customer_name", label: "Customer", type: "text", required: true },
    { key: "customer_email", label: "Customer email", type: "text" },
    { key: "issue_date", label: "Issue date", type: "date" },
    { key: "due_date", label: "Due date", type: "date" },
    { key: "subtotal", label: "Subtotal ($)", type: "number" },
    { key: "tax", label: "Tax ($)", type: "number" },
    { key: "total", label: "Total ($)", type: "number", required: true },
    { key: "status", label: "Status", type: "select", options: [
      { value: "draft", label: "Draft" }, { value: "sent", label: "Sent" },
      { value: "paid", label: "Paid" }, { value: "overdue", label: "Overdue" },
      { value: "void", label: "Void" },
    ] },
    { key: "paid_at", label: "Paid at", type: "date" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
  defaults: { status: "draft" },
};
