import { createFileRoute } from "@tanstack/react-router";
import { ScrollText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/contracts")({
  head: () => ({ meta: [{ title: "Contracts — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS_PALETTE = {
  draft: "border-border bg-muted/40 text-muted-foreground",
  review: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  signed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  expired: "border-destructive/40 bg-destructive/10 text-destructive",
  terminated: "border-destructive/40 bg-destructive/10 text-destructive",
};

const config: ResourceConfig<any> = {
  table: "sales_contracts",
  title: "Contracts",
  eyebrow: "Sales · Contracts",
  icon: ScrollText,
  itemName: "contract",
  searchable: ["title", "party"],
  orderBy: { column: "expiry_date", ascending: true },
  kpis: (rows) => {
    const active = rows.filter((r) => r.status === "active" || r.status === "signed");
    const totalValue = active.reduce((s, r) => s + Number(r.value || 0), 0);
    const soon = active.filter((r) => {
      if (!r.expiry_date) return false;
      const days = (new Date(r.expiry_date).getTime() - Date.now()) / 86400000;
      return days >= 0 && days <= 60;
    }).length;
    return [
      { label: "Contracts", value: rows.length, icon: ScrollText },
      { label: "Active", value: active.length, icon: CheckCircle2 },
      { label: "Active value", value: `$${totalValue.toFixed(0)}`, icon: Clock },
      { label: "Expiring < 60d", value: soon, icon: AlertTriangle },
    ];
  },
  columns: [
    { key: "title", label: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "party", label: "Party" },
    { key: "kind", label: "Type", render: (r) => <span className="text-xs uppercase tracking-wide text-muted-foreground">{r.kind}</span> },
    { key: "value", label: "Value", render: (r) => r.value != null ? <span className="tabular-nums">${Number(r.value).toFixed(0)}</span> : "—" },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS_PALETTE} /> },
    { key: "effective_date", label: "Effective", render: (r) => <DateCell date={r.effective_date} /> },
    { key: "expiry_date", label: "Expires", render: (r) => <DateCell date={r.expiry_date} /> },
    { key: "owner_id", label: "Owner", render: (r, c) => <UserCell userId={r.owner_id} profiles={c.profiles} /> },
  ],
  fields: [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "party", label: "Other party", type: "text" },
    { key: "kind", label: "Type", type: "select", options: [
      { value: "customer", label: "Customer" }, { value: "vendor", label: "Vendor" },
      { value: "partner", label: "Partner" }, { value: "employment", label: "Employment" },
      { value: "nda", label: "NDA" }, { value: "other", label: "Other" },
    ] },
    { key: "value", label: "Value ($)", type: "number" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "draft", label: "Draft" }, { value: "review", label: "In review" },
      { value: "signed", label: "Signed" }, { value: "active", label: "Active" },
      { value: "expired", label: "Expired" }, { value: "terminated", label: "Terminated" },
    ] },
    { key: "effective_date", label: "Effective date", type: "date" },
    { key: "expiry_date", label: "Expiry date", type: "date" },
    { key: "owner_id", label: "Owner", type: "user" },
    { key: "document_url", label: "Document URL", type: "text" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
  defaults: { status: "draft", kind: "customer" },
};
