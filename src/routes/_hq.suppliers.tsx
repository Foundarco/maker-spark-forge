import { createFileRoute } from "@tanstack/react-router";
import { Store, Star } from "lucide-react";
import { ResourcePage } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const config: ResourceConfig<any> = {
  table: "mfg_suppliers",
  title: "Suppliers & Vendors",
  eyebrow: "Manufacturing · Suppliers",
  icon: Store,
  itemName: "supplier",
  searchable: ["name", "contact_name", "email", "category"],
  orderBy: { column: "name", ascending: true },
  kpis: (rows) => {
    const avg = rows.filter((r) => r.rating).length
      ? (rows.filter((r) => r.rating).reduce((s, r) => s + Number(r.rating), 0) / rows.filter((r) => r.rating).length).toFixed(1)
      : "—";
    return [
      { label: "Suppliers", value: rows.length, icon: Store },
      { label: "Categories", value: new Set(rows.map((r) => r.category).filter(Boolean)).size, icon: Store },
      { label: "Avg rating", value: avg, icon: Star },
    ];
  },
  columns: [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "contact_name", label: "Contact" },
    { key: "email", label: "Email", render: (r) => r.email ? <a href={`mailto:${r.email}`} className="text-primary hover:underline text-xs">{r.email}</a> : "—" },
    { key: "phone", label: "Phone" },
    { key: "category", label: "Category" },
    { key: "rating", label: "Rating", render: (r) => r.rating ? <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />{r.rating}</span> : "—" },
  ],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "contact_name", label: "Contact name", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "category", label: "Category", type: "text", placeholder: "Electronics, Metals, Plastics..." },
    { key: "rating", label: "Rating (1-5)", type: "number" },
    { key: "address", label: "Address", type: "textarea", full: true },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
};
