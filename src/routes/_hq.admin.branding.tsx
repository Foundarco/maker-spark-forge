import { createFileRoute } from "@tanstack/react-router";
import { Palette } from "lucide-react";
import { ResourcePage, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "admin_settings",
  title: "Branding",
  eyebrow: "Administration",
  icon: Palette,
  itemName: "branding setting",
  baseFilter: { category: "branding" },
  defaults: { category: "branding" },
  orderBy: { column: "key", ascending: true },
  searchable: ["key", "value"],
  kpis: (rows) => [{ label: "Brand fields", value: rows.length, icon: Palette }],
  columns: [
    { key: "key", label: "Field", render: (r) => <span className="font-medium">{r.key}</span> },
    { key: "value", label: "Value", render: (r) => {
        if (r.key === "primary_color" && r.value) return <span className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded border border-border" style={{ background: r.value }} /><span className="font-mono text-xs">{r.value}</span></span>;
        if (r.key?.includes("logo") && r.value) return <img src={r.value} alt="logo" className="h-8" />;
        return <span className="text-sm">{r.value || "—"}</span>;
      } },
    { key: "description", label: "Description" },
  ],
  fields: [
    { key: "key", label: "Field", type: "select", required: true, options: ["logo_url","logo_dark_url","favicon_url","primary_color","secondary_color","font_family","tagline","brand_voice"].map((v) => ({ value: v, label: v })) },
    { key: "value", label: "Value", type: "textarea", full: true, placeholder: "URL, hex color, or text" },
    { key: "description", label: "Description", type: "text", full: true },
  ],
};

export const Route = createFileRoute("/_hq/admin/branding")({
  head: () => ({ meta: [{ title: "Branding — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
