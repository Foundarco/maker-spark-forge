import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "hr_employees",
  title: "Payroll",
  eyebrow: "HR",
  icon: Wallet,
  itemName: "record",
  baseFilter: { status: "active" },
  defaults: { status: "active", employment_type: "full_time" },
  orderBy: { column: "full_name", ascending: true },
  searchable: ["full_name", "title", "department"],
  kpis: (rows) => [
    { label: "Active", value: rows.length, icon: Wallet },
    { label: "Annual gross", value: `$${rows.reduce((s, r) => s + Number(r.salary || 0), 0).toLocaleString()}`, icon: Wallet },
    { label: "Avg salary", value: rows.length ? `$${(rows.reduce((s, r) => s + Number(r.salary || 0), 0) / rows.length).toFixed(0)}` : "—", icon: Wallet },
  ],
  columns: [
    { key: "full_name", label: "Employee", render: (r) => <span className="font-medium">{r.full_name}</span> },
    { key: "department", label: "Dept", render: (r) => <StatusBadge value={r.department} /> },
    { key: "employment_type", label: "Type", render: (r) => <StatusBadge value={r.employment_type} /> },
    { key: "salary", label: "Salary", render: (r) => r.salary ? <span className="font-mono">${Number(r.salary).toLocaleString()}</span> : "—" },
    { key: "start_date", label: "Started", render: (r) => <DateCell date={r.start_date} /> },
    { key: "manager_id", label: "Manager", render: (r, ctx) => <UserCell userId={r.manager_id} profiles={ctx.profiles} /> },
  ],
  fields: [
    { key: "full_name", label: "Employee", type: "text", required: true },
    { key: "email", label: "Email", type: "text" },
    { key: "title", label: "Title", type: "text" },
    { key: "department", label: "Department", type: "select", options: ["Engineering","Manufacturing","Sales","Marketing","Finance","HR","IT","Support","Operations"].map((v) => ({ value: v, label: v })) },
    { key: "employment_type", label: "Type", type: "select", options: [{ value: "full_time", label: "Full-time" }, { value: "part_time", label: "Part-time" }, { value: "contract", label: "Contract" }] },
    { key: "salary", label: "Annual salary", type: "number" },
    { key: "start_date", label: "Start date", type: "date" },
    { key: "manager_id", label: "Manager", type: "user" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/payroll")({
  head: () => ({ meta: [{ title: "Payroll — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
