import { createFileRoute } from "@tanstack/react-router";
import { Filter, TrendingUp, DollarSign, Target } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/pipeline")({
  head: () => ({ meta: [{ title: "Sales Pipeline — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STAGE_PALETTE = {
  lead: "border-border bg-muted/40 text-muted-foreground",
  qualified: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  proposal: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  negotiation: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  won: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  lost: "border-destructive/40 bg-destructive/10 text-destructive",
};

const config: ResourceConfig<any> = {
  table: "sales_deals",
  title: "Sales Pipeline",
  eyebrow: "Sales · Pipeline",
  icon: Filter,
  itemName: "deal",
  searchable: ["title", "company", "contact_name", "contact_email"],
  orderBy: { column: "expected_close", ascending: true },
  kpis: (rows) => {
    const open = rows.filter((r) => !["won", "lost"].includes(r.stage));
    const pipelineValue = open.reduce((s, r) => s + Number(r.value || 0), 0);
    const won = rows.filter((r) => r.stage === "won");
    const wonValue = won.reduce((s, r) => s + Number(r.value || 0), 0);
    return [
      { label: "Open deals", value: open.length, icon: Filter },
      { label: "Pipeline $", value: `$${pipelineValue.toFixed(0)}`, icon: DollarSign },
      { label: "Won this list", value: won.length, icon: Target },
      { label: "Won $", value: `$${wonValue.toFixed(0)}`, icon: TrendingUp },
    ];
  },
  columns: [
    { key: "title", label: "Deal", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "company", label: "Company", render: (r) => <div className="text-xs"><div>{r.company || "—"}</div>{r.contact_name && <div className="text-muted-foreground">{r.contact_name}</div>}</div> },
    { key: "stage", label: "Stage", render: (r) => <StatusBadge value={r.stage} palette={STAGE_PALETTE} /> },
    { key: "value", label: "Value", render: (r) => r.value != null ? <span className="tabular-nums font-medium">${Number(r.value).toFixed(0)}</span> : "—" },
    { key: "probability", label: "Prob", render: (r) => r.probability != null ? `${r.probability}%` : "—" },
    { key: "expected_close", label: "Close", render: (r) => <DateCell date={r.expected_close} /> },
    { key: "owner_id", label: "Owner", render: (r, c) => <UserCell userId={r.owner_id} profiles={c.profiles} /> },
  ],
  fields: [
    { key: "title", label: "Deal name", type: "text", required: true },
    { key: "company", label: "Company", type: "text" },
    { key: "contact_name", label: "Contact name", type: "text" },
    { key: "contact_email", label: "Contact email", type: "text" },
    { key: "stage", label: "Stage", type: "select", options: [
      { value: "lead", label: "Lead" }, { value: "qualified", label: "Qualified" },
      { value: "proposal", label: "Proposal" }, { value: "negotiation", label: "Negotiation" },
      { value: "won", label: "Closed – Won" }, { value: "lost", label: "Closed – Lost" },
    ] },
    { key: "value", label: "Value ($)", type: "number" },
    { key: "probability", label: "Probability (%)", type: "number" },
    { key: "expected_close", label: "Expected close", type: "date" },
    { key: "owner_id", label: "Owner", type: "user" },
    { key: "source", label: "Source", type: "text", placeholder: "Referral, website, cold outbound..." },
    { key: "notes", label: "Notes", type: "textarea", full: true },
    { key: "tags", label: "Tags", type: "tags", full: true },
  ],
  defaults: { stage: "lead" },
};
