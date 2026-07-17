import { createFileRoute } from "@tanstack/react-router";
import { Filter, FileText } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, type ResourceConfig } from "@/components/hq/ResourcePage";
import { useState } from "react";

const rulesCfg: ResourceConfig<any> = {
  table: "hq_email_rules",
  title: "Email Rules",
  eyebrow: "Email",
  icon: Filter,
  itemName: "rule",
  orderBy: { column: "created_at", ascending: false },
  searchable: ["name", "match_value"],
  kpis: (rows) => [
    { label: "Rules", value: rows.length, icon: Filter },
    { label: "Active", value: rows.filter((r) => r.active).length, icon: Filter },
  ],
  columns: [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "match_field", label: "When", render: (r) => <span className="text-sm text-muted-foreground">{r.match_field} contains "{r.match_value}"</span> },
    { key: "action", label: "Action", render: (r) => <StatusBadge value={r.action} /> },
    { key: "action_value", label: "Value" },
    { key: "active", label: "Active", render: (r) => <StatusBadge value={r.active ? "on" : "off"} palette={{ on: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", off: "border-border bg-muted/40 text-muted-foreground" }} /> },
  ],
  fields: [
    { key: "name", label: "Rule name", type: "text", required: true, full: true },
    { key: "match_field", label: "Match field", type: "select", options: [{ value: "from_addr", label: "From" }, { value: "to_addr", label: "To" }, { value: "subject", label: "Subject" }, { value: "body", label: "Body" }], required: true },
    { key: "match_value", label: "Match value (contains)", type: "text", required: true },
    { key: "action", label: "Action", type: "select", options: [{ value: "label", label: "Apply label" }, { value: "forward", label: "Forward" }, { value: "move", label: "Move to folder" }, { value: "reply", label: "Auto-reply" }, { value: "delete", label: "Delete" }], required: true },
    { key: "action_value", label: "Action value", type: "text", placeholder: "label name / folder / email" },
    { key: "active", label: "Active", type: "bool", placeholder: "Enabled" },
  ],
};

const templatesCfg: ResourceConfig<any> = {
  table: "hq_email_templates",
  title: "Email Templates",
  eyebrow: "Email",
  icon: FileText,
  itemName: "template",
  orderBy: { column: "created_at", ascending: false },
  searchable: ["name", "subject", "category"],
  kpis: (rows) => [
    { label: "Templates", value: rows.length, icon: FileText },
    { label: "Categories", value: new Set(rows.map((r) => r.category).filter(Boolean)).size, icon: FileText },
  ],
  columns: [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "category", label: "Category", render: (r) => <StatusBadge value={r.category} /> },
    { key: "subject", label: "Subject" },
    { key: "updated_at", label: "Updated", render: (r) => <DateCell date={r.updated_at} /> },
  ],
  fields: [
    { key: "name", label: "Template name", type: "text", required: true },
    { key: "category", label: "Category", type: "select", options: [{ value: "sales", label: "Sales" }, { value: "support", label: "Support" }, { value: "onboarding", label: "Onboarding" }, { value: "general", label: "General" }, { value: "marketing", label: "Marketing" }] },
    { key: "subject", label: "Subject", type: "text", required: true, full: true },
    { key: "body", label: "Body", type: "textarea", full: true },
  ],
};

function RulesAndTemplates() {
  const [tab, setTab] = useState<"rules" | "templates">("rules");
  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <div className="inline-flex rounded-lg border border-border bg-card p-1 text-sm">
          <button onClick={() => setTab("rules")} className={`px-3 py-1.5 rounded-md ${tab === "rules" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Rules</button>
          <button onClick={() => setTab("templates")} className={`px-3 py-1.5 rounded-md ${tab === "templates" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Templates</button>
        </div>
      </div>
      <ResourcePage key={tab} config={tab === "rules" ? rulesCfg : templatesCfg} />
    </div>
  );
}

export const Route = createFileRoute("/_hq/mail-rules")({
  head: () => ({ meta: [{ title: "Rules & Templates — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: RulesAndTemplates,
});
