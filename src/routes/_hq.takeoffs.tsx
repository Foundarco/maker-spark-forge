import { createFileRoute } from "@tanstack/react-router";
import { Ruler } from "lucide-react";
import { ResourcePage, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "con_estimate_lines",
  title: "Takeoffs & RFQs",
  eyebrow: "Preconstruction",
  icon: Ruler,
  itemName: "line item",
  noCreatedBy: true,
  orderBy: { column: "created_at", ascending: false },
  searchable: ["description", "category", "unit"],
  kpis: (rows) => [
    { label: "Line items", value: rows.length, icon: Ruler },
    { label: "Takeoff value", value: `$${rows.reduce((s, r) => s + Number(r.total || 0), 0).toLocaleString()}`, icon: Ruler },
    { label: "Categories", value: new Set(rows.map((r) => r.category).filter(Boolean)).size, icon: Ruler },
  ],
  columns: [
    { key: "description", label: "Item", render: (r) => <span className="font-medium">{r.description}</span> },
    { key: "category", label: "Category" },
    { key: "quantity", label: "Qty", render: (r) => <span className="font-mono text-xs">{Number(r.quantity || 0).toLocaleString()} {r.unit ?? ""}</span> },
    { key: "unit_cost", label: "Unit cost", render: (r) => <span className="font-mono">${Number(r.unit_cost || 0).toLocaleString()}</span> },
    { key: "total", label: "Total", render: (r) => <span className="font-mono font-medium">${Number(r.total || 0).toLocaleString()}</span> },
  ],
  fields: [
    { key: "description", label: "Description", type: "text", required: true, full: true },
    { key: "category", label: "Category", type: "select", options: ["Labor", "Materials", "Equipment", "Sitework", "Subcontract", "Permits", "Other"].map((v) => ({ value: v, label: v })) },
    { key: "quantity", label: "Quantity", type: "number" },
    { key: "unit", label: "Unit", type: "select", options: ["ea", "hr", "sf", "lf", "cy", "ton", "ls"].map((v) => ({ value: v, label: v })) },
    { key: "unit_cost", label: "Unit cost", type: "number" },
    { key: "total", label: "Line total", type: "number" },
  ],
};

export const Route = createFileRoute("/_hq/takeoffs")({
  head: () => ({ meta: [{ title: "Takeoffs & RFQs — McGuire HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
