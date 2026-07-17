import { createFileRoute } from "@tanstack/react-router";
import { IdCard, Users, Building2, UserCheck } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "hr_employees",
  title: "People",
  eyebrow: "HR",
  icon: IdCard,
  itemName: "employee",
  orderBy: { column: "full_name", ascending: true },
  searchable: ["full_name", "email", "title", "department"],
  defaults: { status: "active", employment_type: "full_time" },
  kpis: (rows) => [
    { label: "Total", value: rows.length, icon: Users },
    { label: "Active", value: rows.filter((r) => r.status === "active").length, icon: UserCheck },
    { label: "Departments", value: new Set(rows.map((r) => r.department).filter(Boolean)).size, icon: Building2 },
    { label: "Full-time", value: rows.filter((r) => r.employment_type === "full_time").length, icon: Users },
  ],
  columns: [
    { key: "full_name", label: "Name", render: (r) => <span className="font-medium">{r.full_name}</span> },
    { key: "title", label: "Title" },
    { key: "department", label: "Dept", render: (r) => <StatusBadge value={r.department} /> },
    { key: "employment_type", label: "Type", render: (r) => <StatusBadge value={r.employment_type} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={{ active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", on_leave: "border-amber-500/20 bg-amber-500/10 text-amber-600", terminated: "border-destructive/20 bg-destructive/10 text-destructive" }} /> },
    { key: "start_date", label: "Started", render: (r) => <DateCell date={r.start_date} /> },
    { key: "manager_id", label: "Manager", render: (r, ctx) => <UserCell userId={r.manager_id} profiles={ctx.profiles} /> },
  ],
  fields: [
    { key: "full_name", label: "Full name", type: "text", required: true },
    { key: "email", label: "Email", type: "text" },
    { key: "user_id", label: "HQ user", type: "user" },
    { key: "title", label: "Job title", type: "text" },
    { key: "department", label: "Department", type: "select", options: ["Engineering","Manufacturing","Sales","Marketing","Finance","HR","IT","Support","Operations","Executive"].map((v) => ({ value: v, label: v })) },
    { key: "employment_type", label: "Type", type: "select", options: [{ value: "full_time", label: "Full-time" }, { value: "part_time", label: "Part-time" }, { value: "contract", label: "Contract" }, { value: "intern", label: "Intern" }] },
    { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "on_leave", label: "On leave" }, { value: "terminated", label: "Terminated" }] },
    { key: "start_date", label: "Start date", type: "date" },
    { key: "end_date", label: "End date", type: "date" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "location", label: "Location", type: "text" },
    { key: "salary", label: "Salary", type: "number" },
    { key: "manager_id", label: "Manager", type: "user" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/employees")({
  head: () => ({ meta: [{ title: "People — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
