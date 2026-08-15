import { createFileRoute } from "@tanstack/react-router";
import { Landmark, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { ResourcePage, AccountCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/accounting")({
  head: () => ({ meta: [{ title: "Accounting — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const config: ResourceConfig<any> = {
  table: "fin_transactions",
  title: "Accounting",
  eyebrow: "Funding · Journal",
  icon: Landmark,
  itemName: "entry",
  searchable: ["memo", "reference"],
  orderBy: { column: "transaction_date", ascending: false },
  kpis: (rows) => {
    const debits = rows.filter((r) => r.kind === "deposit").reduce((s, r) => s + Number(r.amount || 0), 0);
    const credits = rows.filter((r) => r.kind === "withdrawal").reduce((s, r) => s + Number(r.amount || 0), 0);
    const unreconciled = rows.filter((r) => !r.reconciled).length;
    return [
      { label: "Entries", value: rows.length, icon: Landmark },
      { label: "Deposits", value: `$${debits.toFixed(0)}`, icon: ArrowUpRight },
      { label: "Withdrawals", value: `$${credits.toFixed(0)}`, icon: ArrowDownRight },
      { label: "Unreconciled", value: unreconciled, icon: Wallet },
    ];
  },
  columns: [
    { key: "transaction_date", label: "Date", render: (r) => <DateCell date={r.transaction_date} /> },
    { key: "memo", label: "Memo", render: (r) => <span className="font-medium">{r.memo}</span> },
    { key: "kind", label: "Kind", render: (r) => <span className="text-xs uppercase tracking-wide text-muted-foreground">{r.kind}</span> },
    { key: "debit_account_id", label: "Debit", render: (r, c) => <AccountCell accountId={r.debit_account_id} accounts={c.accounts} /> },
    { key: "credit_account_id", label: "Credit", render: (r, c) => <AccountCell accountId={r.credit_account_id} accounts={c.accounts} /> },
    { key: "amount", label: "Amount", render: (r) => <span className="tabular-nums font-medium">${Number(r.amount).toFixed(2)}</span> },
    { key: "reference", label: "Ref", render: (r) => r.reference ? <span className="font-mono text-xs">{r.reference}</span> : "—" },
    { key: "reconciled", label: "Rec.", render: (r) => r.reconciled ? <span className="text-emerald-500 text-xs">✓</span> : <span className="text-muted-foreground text-xs">—</span> },
  ],
  fields: [
    { key: "transaction_date", label: "Date", type: "date", required: true },
    { key: "memo", label: "Memo / description", type: "text", required: true },
    { key: "kind", label: "Kind", type: "select", options: [
      { value: "journal", label: "Journal entry" }, { value: "deposit", label: "Deposit" },
      { value: "withdrawal", label: "Withdrawal" }, { value: "transfer", label: "Transfer" },
      { value: "expense", label: "Expense" },
    ] },
    { key: "debit_account_id", label: "Debit account", type: "account" },
    { key: "credit_account_id", label: "Credit account", type: "account" },
    { key: "amount", label: "Amount ($)", type: "number", required: true },
    { key: "reference", label: "Reference", type: "text", placeholder: "Invoice #, check #..." },
    { key: "reconciled", label: "Reconciled", type: "bool" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
  defaults: { kind: "journal", reconciled: false },
};
