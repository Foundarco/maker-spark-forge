import { createFileRoute } from "@tanstack/react-router";
import { Building } from "lucide-react";
import { ResourcePage, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "admin_settings",
  title: "Company",
  eyebrow: "Administration",
  icon: Building,
  itemName: "setting",
  baseFilter: { category: "company" },
  defaults: { category: "company" },
  orderBy: { column: "key", ascending: true },
  searchable: ["key", "value", "description"],
  kpis: (rows) => [
    { label: "Fields", value: rows.length, icon: Building },
  ],
  columns: [
    { key: "key", label: "Field", render: (r) => <span className="font-medium">{r.key}</span> },
    { key: "value", label: "Value", render: (r) => <span className="text-sm">{r.value || "—"}</span> },
    { key: "description", label: "Description", render: (r) => <span className="text-muted-foreground text-xs">{r.description || "—"}</span> },
  ],
  fields: [
    { key: "key", label: "Field", type: "text", required: true, placeholder: "e.g. legal_name, ein, hq_address" },
    { key: "value", label: "Value", type: "textarea", full: true },
    { key: "description", label: "Description", type: "text", full: true },
  ],
};

export const Route = createFileRoute("/_hq/admin/company")({
  head: () => ({ meta: [{ title: "Company — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
