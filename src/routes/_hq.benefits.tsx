import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";
import { ResourcePage, StatusBadge, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "hr_benefits",
  title: "Benefits",
  eyebrow: "HR",
  icon: HeartHandshake,
  itemName: "benefit",
  orderBy: { column: "name", ascending: true },
  searchable: ["name", "provider", "type"],
  defaults: { active: true },
  kpis: (rows) => [
    { label: "Plans", value: rows.length, icon: HeartHandshake },
    { label: "Active", value: rows.filter((r) => r.active).length, icon: HeartHandshake },
    { label: "Monthly cost", value: `$${rows.filter((r) => r.active).reduce((s, r) => s + Number(r.monthly_cost || 0), 0).toFixed(0)}`, icon: HeartHandshake },
  ],
  columns: [
    { key: "name", label: "Plan", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "provider", label: "Provider" },
    { key: "type", label: "Type", render: (r) => <StatusBadge value={r.type} /> },
    { key: "monthly_cost", label: "Cost/mo", render: (r) => r.monthly_cost ? <span className="font-mono">${Number(r.monthly_cost).toFixed(2)}</span> : "—" },
    { key: "active", label: "Active", render: (r) => <StatusBadge value={r.active ? "yes" : "no"} palette={{ yes: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", no: "border-border bg-muted/40" }} /> },
  ],
  fields: [
    { key: "name", label: "Plan name", type: "text", required: true },
    { key: "provider", label: "Provider", type: "text" },
    { key: "type", label: "Type", type: "select", options: ["health","dental","vision","401k","life","disability","stipend","other"].map((v) => ({ value: v, label: v })) },
    { key: "monthly_cost", label: "Monthly cost", type: "number" },
    { key: "employer_contribution", label: "Employer %", type: "number" },
    { key: "active", label: "Active", type: "bool" },
    { key: "enrollment_deadline", label: "Enrollment deadline", type: "date" },
    { key: "description", label: "Description", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/benefits")({
  head: () => ({ meta: [{ title: "Benefits — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
