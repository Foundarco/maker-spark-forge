import { createFileRoute } from "@tanstack/react-router";
import { Gavel } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "hr_policies",
  title: "Policies",
  eyebrow: "HR",
  icon: Gavel,
  itemName: "policy",
  orderBy: { column: "updated_at", ascending: false },
  searchable: ["title", "category"],
  defaults: { active: true, version: "1.0" },
  kpis: (rows) => [
    { label: "Policies", value: rows.length, icon: Gavel },
    { label: "Active", value: rows.filter((r) => r.active).length, icon: Gavel },
    { label: "Categories", value: new Set(rows.map((r) => r.category).filter(Boolean)).size, icon: Gavel },
  ],
  columns: [
    { key: "title", label: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "category", label: "Category", render: (r) => <StatusBadge value={r.category} /> },
    { key: "version", label: "Version", render: (r) => <span className="font-mono text-xs">v{r.version}</span> },
    { key: "effective_date", label: "Effective", render: (r) => <DateCell date={r.effective_date} /> },
    { key: "active", label: "Active", render: (r) => <StatusBadge value={r.active ? "yes" : "no"} palette={{ yes: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", no: "border-border bg-muted/40" }} /> },
  ],
  fields: [
    { key: "title", label: "Title", type: "text", required: true, full: true },
    { key: "category", label: "Category", type: "select", options: ["Code of Conduct","Leave","Compensation","Security","Remote Work","Health & Safety","Anti-Harassment","IT Use","Other"].map((v) => ({ value: v, label: v })) },
    { key: "version", label: "Version", type: "text" },
    { key: "effective_date", label: "Effective date", type: "date" },
    { key: "active", label: "Active", type: "bool" },
    { key: "content", label: "Content", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/policies")({
  head: () => ({ meta: [{ title: "Policies — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
