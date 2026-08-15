import { createFileRoute } from "@tanstack/react-router";
import { Boxes, AlertCircle } from "lucide-react";
import { ResourcePage, SupplierCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const config: ResourceConfig<any> = {
  table: "mfg_inventory",
  title: "Parts Inventory",
  eyebrow: "Fleet & Supply · Inventory",
  icon: Boxes,
  itemName: "item",
  searchable: ["sku", "name", "category", "location"],
  orderBy: { column: "name", ascending: true },
  kpis: (rows) => {
    const value = rows.reduce((s, r) => s + Number(r.quantity || 0) * Number(r.unit_cost || 0), 0);
    const lowStock = rows.filter((r) => Number(r.quantity || 0) <= Number(r.reorder_point || 0)).length;
    return [
      { label: "SKUs", value: rows.length, icon: Boxes },
      { label: "Low stock", value: lowStock, icon: AlertCircle, hint: "At/below reorder point" },
      { label: "Categories", value: new Set(rows.map((r) => r.category).filter(Boolean)).size, icon: Boxes },
      { label: "Stock value", value: `$${value.toFixed(0)}`, icon: Boxes },
    ];
  },
  columns: [
    { key: "sku", label: "SKU", render: (r) => <span className="font-mono text-xs">{r.sku}</span> },
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "category", label: "Category" },
    { key: "quantity", label: "On hand", render: (r) => {
      const low = Number(r.quantity || 0) <= Number(r.reorder_point || 0);
      return <span className={`tabular-nums ${low ? "text-destructive font-medium" : ""}`}>{r.quantity}{low && " ⚠"}</span>;
    } },
    { key: "reorder_point", label: "Reorder at", render: (r) => <span className="tabular-nums text-muted-foreground">{r.reorder_point}</span> },
    { key: "unit_cost", label: "Unit $", render: (r) => r.unit_cost ? `$${Number(r.unit_cost).toFixed(2)}` : "—" },
    { key: "location", label: "Location" },
    { key: "supplier_id", label: "Supplier", render: (r, c) => <SupplierCell supplierId={r.supplier_id} suppliers={c.suppliers} /> },
  ],
  fields: [
    { key: "sku", label: "SKU", type: "text", required: true },
    { key: "name", label: "Name", type: "text", required: true },
    { key: "category", label: "Category", type: "text" },
    { key: "quantity", label: "Quantity on hand", type: "number", required: true },
    { key: "reorder_point", label: "Reorder point", type: "number" },
    { key: "unit_cost", label: "Unit cost ($)", type: "number" },
    { key: "location", label: "Location", type: "text", placeholder: "Aisle/Bin/Shelf" },
    { key: "supplier_id", label: "Supplier", type: "supplier" },
    { key: "description", label: "Description", type: "textarea", full: true },
  ],
  defaults: { quantity: 0, reorder_point: 0 },
};
