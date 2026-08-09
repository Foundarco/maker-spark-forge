import { createFileRoute } from "@tanstack/react-router";
import { Target } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, ClientCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STAGE = {
  new: "border-border bg-muted/40 text-muted-foreground",
  qualifying: "border-blue-200 bg-blue-50 text-blue-700",
  walkthrough: "border-indigo-200 bg-indigo-50 text-indigo-700",
  bidding: "border-amber-200 bg-amber-50 text-amber-700",
  submitted: "border-purple-200 bg-purple-50 text-purple-700",
  won: "border-emerald-200 bg-emerald-50 text-emerald-700",
  lost: "border-red-200 bg-red-50 text-red-700",
};

const OPEN = ["new", "qualifying", "walkthrough", "bidding", "submitted"];

const cfg: ResourceConfig<any> = {
  table: "con_leads",
  title: "Leads & Bids",
  eyebrow: "Preconstruction",
  icon: Target,
  itemName: "lead",
  orderBy: { column: "bid_due_date", ascending: true },
  searchable: ["title", "lead_number", "contact_name", "contact_email", "source", "location", "project_type", "notes"],
  kpis: (rows) => {
    const open = rows.filter((r) => OPEN.includes(r.stage));
    const won = rows.filter((r) => r.stage === "won");
    const weighted = open.reduce((s, r) => s + (Number(r.estimated_value || 0) * Number(r.probability || 0)) / 100, 0);
    const decided = rows.filter((r) => r.stage === "won" || r.stage === "lost").length;
    return [
      { label: "Open leads", value: open.length, icon: Target },
      { label: "Pipeline value", value: `$${open.reduce((s, r) => s + Number(r.estimated_value || 0), 0).toLocaleString()}`, icon: Target },
      { label: "Weighted", value: `$${Math.round(weighted).toLocaleString()}`, icon: Target },
      { label: "Win rate", value: decided ? `${Math.round((won.length / decided) * 100)}%` : "—", icon: Target },
    ];
  },
  columns: [
    { key: "title", label: "Opportunity", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "lead_number", label: "Lead #", render: (r) => <span className="font-mono text-xs">{r.lead_number ?? "—"}</span> },
    { key: "client_id", label: "Client", render: (r, c) => <ClientCell clientId={r.client_id} clients={c.clients} /> },
    { key: "project_type", label: "Type" },
    { key: "estimated_value", label: "Value", render: (r) => <span className="font-mono">${Number(r.estimated_value || 0).toLocaleString()}</span> },
    { key: "probability", label: "Win %", render: (r) => <span className="font-mono text-xs">{r.probability ?? 0}%</span> },
    { key: "bid_due_date", label: "Bid due", render: (r) => <DateCell date={r.bid_due_date} /> },
    { key: "owner_id", label: "Owner", render: (r, c) => <UserCell userId={r.owner_id} profiles={c.profiles} /> },
    { key: "stage", label: "Stage", render: (r) => <StatusBadge value={r.stage} palette={STAGE} /> },
  ],
  fields: [
    { key: "title", label: "Opportunity", type: "text", required: true, full: true },
    { key: "lead_number", label: "Lead number", type: "text", placeholder: "L-001" },
    { key: "client_id", label: "Client", type: "client" },
    { key: "contact_name", label: "Contact name", type: "text" },
    { key: "contact_email", label: "Contact email", type: "text" },
    { key: "contact_phone", label: "Contact phone", type: "text" },
    { key: "source", label: "Source", type: "select", options: ["Referral", "Repeat client", "Website", "Bid board", "Cold outreach", "Architect", "Other"].map((v) => ({ value: v, label: v })) },
    { key: "project_type", label: "Project type", type: "select", options: ["Residential", "Commercial", "Renovation", "Addition", "Sitework", "Concrete", "Excavation", "Other"].map((v) => ({ value: v, label: v })) },
    { key: "location", label: "Location", type: "text" },
    { key: "estimated_value", label: "Estimated value ($)", type: "number" },
    { key: "probability", label: "Probability (%)", type: "number" },
    { key: "bid_due_date", label: "Bid due", type: "date" },
    { key: "walkthrough_date", label: "Walkthrough", type: "date" },
    { key: "owner_id", label: "Owner", type: "user" },
    { key: "stage", label: "Stage", type: "select", options: ["new", "qualifying", "walkthrough", "bidding", "submitted", "won", "lost"].map((v) => ({ value: v, label: v })) },
    { key: "notes", label: "Scope / notes", type: "textarea", full: true },
  ],
  defaults: { stage: "new", probability: 50 },
};

export const Route = createFileRoute("/_hq/leads")({
  head: () => ({ meta: [{ title: "Leads & Bids — McGuire HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
