import { createFileRoute } from "@tanstack/react-router";
import { ListTree } from "lucide-react";
import { ResourcePage, StatusBadge, ProjectCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/bom")({
  head: () => ({ meta: [{ title: "BOM & Changes — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const RISK = { low: "border-green-500/30 bg-green-500/10 text-green-500", medium: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500", high: "border-destructive/30 bg-destructive/10 text-destructive" };

const config: ResourceConfig<any> = {
  table: "eng_bom_items",
  title: "Bill of Materials",
  eyebrow: "Engineering · BOM",
  icon: ListTree,
  itemName: "line item",
  searchable: ["part_number", "name", "supplier"],
  orderBy: { column: "part_number", ascending: true },
  kpis: (rows) => {
    const total = rows.reduce((s, r) => s + Number(r.quantity || 0) * Number(r.unit_cost || 0), 0);
    return [
      { label: "Items", value: rows.length, icon: ListTree },
      { label: "High risk", value: rows.filter((r) => r.risk_level === "high").length, icon: ListTree },
      { label: "Suppliers", value: new Set(rows.map((r) => r.supplier).filter(Boolean)).size, icon: ListTree },
      { label: "Total cost", value: `$${total.toFixed(2)}`, icon: ListTree },
    ];
  },
  columns: [
    { key: "part_number", label: "Part #", render: (r) => <span className="font-mono text-xs">{r.part_number}</span> },
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "quantity", label: "Qty", render: (r) => <span className="tabular-nums">{r.quantity}</span> },
    { key: "unit_cost", label: "Unit $", render: (r) => r.unit_cost ? `$${Number(r.unit_cost).toFixed(2)}` : "—" },
    { key: "supplier", label: "Supplier" },
    { key: "risk_level", label: "Risk", render: (r) => <StatusBadge value={r.risk_level} palette={RISK} /> },
    { key: "project_id", label: "Project", render: (r, c) => <ProjectCell projectId={r.project_id} projects={c.projects} /> },
  ],
  fields: [
    { key: "part_number", label: "Part number", type: "text", required: true },
    { key: "name", label: "Name", type: "text", required: true },
    { key: "quantity", label: "Quantity", type: "number", required: true },
    { key: "unit_cost", label: "Unit cost ($)", type: "number" },
    { key: "supplier", label: "Supplier name", type: "text" },
    { key: "risk_level", label: "Risk", type: "select", options: [
      { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" },
    ] },
    { key: "project_id", label: "Project", type: "project" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
  defaults: { quantity: 1, risk_level: "low" },
};
