import { createFileRoute } from "@tanstack/react-router";
import { Tag, Percent, CheckCircle2, Calendar } from "lucide-react";
import { ResourcePage, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/pricing-admin")({
  head: () => ({ meta: [{ title: "Pricing & Discounts — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const config: ResourceConfig<any> = {
  table: "sales_price_rules",
  title: "Pricing & Discounts",
  eyebrow: "Sales · Pricing",
  icon: Tag,
  itemName: "rule",
  searchable: ["name", "code"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => {
    const now = Date.now();
    const active = rows.filter((r) => r.active && (!r.ends_at || new Date(r.ends_at).getTime() >= now));
    return [
      { label: "Rules", value: rows.length, icon: Tag },
      { label: "Active", value: active.length, icon: CheckCircle2 },
      { label: "Percent-off", value: rows.filter((r) => r.discount_percent != null && r.discount_percent > 0).length, icon: Percent },
      { label: "Ending < 30d", value: active.filter((r) => r.ends_at && (new Date(r.ends_at).getTime() - now) / 86400000 <= 30).length, icon: Calendar },
    ];
  },
  columns: [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "code", label: "Code", render: (r) => r.code ? <span className="font-mono text-xs">{r.code}</span> : "—" },
    { key: "kind", label: "Type" },
    { key: "discount_percent", label: "%", render: (r) => r.discount_percent != null ? `${r.discount_percent}%` : "—" },
    { key: "discount_amount", label: "Flat $", render: (r) => r.discount_amount != null ? `$${Number(r.discount_amount).toFixed(2)}` : "—" },
    { key: "minimum_quantity", label: "Min qty", render: (r) => r.minimum_quantity ?? "—" },
    { key: "starts_at", label: "Starts", render: (r) => <DateCell date={r.starts_at} /> },
    { key: "ends_at", label: "Ends", render: (r) => <DateCell date={r.ends_at} /> },
    { key: "active", label: "Active", render: (r) => r.active ? <span className="text-emerald-500 text-xs">Yes</span> : <span className="text-muted-foreground text-xs">No</span> },
  ],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "code", label: "Code / coupon", type: "text", placeholder: "SUMMER25" },
    { key: "kind", label: "Type", type: "select", options: [
      { value: "discount", label: "Discount" }, { value: "promo", label: "Promo code" },
      { value: "tier", label: "Volume tier" }, { value: "loyalty", label: "Loyalty" },
    ] },
    { key: "discount_percent", label: "Discount %", type: "number" },
    { key: "discount_amount", label: "Flat discount ($)", type: "number" },
    { key: "minimum_quantity", label: "Minimum quantity", type: "number" },
    { key: "starts_at", label: "Starts", type: "date" },
    { key: "ends_at", label: "Ends", type: "date" },
    { key: "active", label: "Active", type: "bool" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
  defaults: { active: true, kind: "discount" },
};
