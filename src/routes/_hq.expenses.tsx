import { createFileRoute } from "@tanstack/react-router";
import { Receipt, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/expenses")({
  head: () => ({ meta: [{ title: "Expenses & Budgets — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS_PALETTE = {
  submitted: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  reimbursed: "border-border bg-muted/40 text-muted-foreground",
  rejected: "border-destructive/40 bg-destructive/10 text-destructive",
};

const config: ResourceConfig<any> = {
  table: "fin_expenses",
  title: "Expenses & Budgets",
  eyebrow: "Funding · Expenses",
  icon: Receipt,
  itemName: "expense",
  searchable: ["purpose", "category"],
  orderBy: { column: "spent_at", ascending: false },
  kpis: (rows) => {
    const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0);
    const pending = rows.filter((r) => r.status === "submitted");
    const approved = rows.filter((r) => r.status === "approved" || r.status === "reimbursed");
    return [
      { label: "Expenses", value: rows.length, icon: Receipt },
      { label: "Total $", value: `$${total.toFixed(0)}`, icon: DollarSign },
      { label: "Awaiting", value: pending.length, icon: Clock },
      { label: "Approved", value: approved.length, icon: CheckCircle2 },
    ];
  },
  columns: [
    { key: "purpose", label: "Purpose", render: (r) => <span className="font-medium">{r.purpose}</span> },
    { key: "category", label: "Category" },
    { key: "amount", label: "Amount", render: (r) => <span className="tabular-nums font-medium">${Number(r.amount).toFixed(2)}</span> },
    { key: "spent_at", label: "Date", render: (r) => <DateCell date={r.spent_at} /> },
    { key: "submitter_id", label: "Submitter", render: (r, c) => <UserCell userId={r.submitter_id} profiles={c.profiles} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS_PALETTE} /> },
    { key: "reimbursed", label: "Reimbursed", render: (r) => r.reimbursed ? <span className="text-emerald-500 text-xs">✓</span> : <span className="text-muted-foreground text-xs">—</span> },
  ],
  fields: [
    { key: "purpose", label: "Purpose", type: "text", required: true },
    { key: "category", label: "Category", type: "select", options: [
      { value: "travel", label: "Travel" }, { value: "meals", label: "Meals" },
      { value: "software", label: "Software" }, { value: "hardware", label: "Hardware" },
      { value: "office", label: "Office" }, { value: "marketing", label: "Marketing" },
      { value: "other", label: "Other" },
    ] },
    { key: "amount", label: "Amount ($)", type: "number", required: true },
    { key: "spent_at", label: "Spent on", type: "date" },
    { key: "submitter_id", label: "Submitter", type: "user" },
    { key: "approver_id", label: "Approver", type: "user" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "submitted", label: "Submitted" }, { value: "approved", label: "Approved" },
      { value: "reimbursed", label: "Reimbursed" }, { value: "rejected", label: "Rejected" },
    ] },
    { key: "reimbursed", label: "Reimbursed", type: "bool" },
    { key: "receipt_url", label: "Receipt URL", type: "text" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
  defaults: { status: "submitted", reimbursed: false },
};
