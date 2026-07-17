import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { ResourcePage, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "hr_departments",
  title: "Departments",
  eyebrow: "Administration",
  icon: Building2,
  itemName: "department",
  orderBy: { column: "name", ascending: true },
  searchable: ["name", "description"],
  kpis: (rows) => [
    { label: "Departments", value: rows.length, icon: Building2 },
    { label: "Total headcount", value: rows.reduce((s, r) => s + Number(r.headcount || 0), 0), icon: Building2 },
    { label: "Total budget", value: `$${rows.reduce((s, r) => s + Number(r.budget || 0), 0).toLocaleString()}`, icon: Building2 },
  ],
  columns: [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "lead_id", label: "Lead", render: (r, ctx) => <UserCell userId={r.lead_id} profiles={ctx.profiles} /> },
    { key: "headcount", label: "Headcount" },
    { key: "budget", label: "Budget", render: (r) => r.budget ? <span className="font-mono">${Number(r.budget).toLocaleString()}</span> : "—" },
    { key: "description", label: "Description" },
  ],
  fields: [
    { key: "name", label: "Department name", type: "text", required: true },
    { key: "lead_id", label: "Department lead", type: "user" },
    { key: "headcount", label: "Headcount", type: "number" },
    { key: "budget", label: "Annual budget", type: "number" },
    { key: "description", label: "Description", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/admin/departments")({
  head: () => ({ meta: [{ title: "Departments — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
