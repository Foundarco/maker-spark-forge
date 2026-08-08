import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, JobCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STATUS = { planned: "border-blue-200 bg-blue-50 text-blue-700", active: "border-emerald-200 bg-emerald-50 text-emerald-700", complete: "border-border bg-muted/40 text-muted-foreground" };

const cfg: ResourceConfig<any> = {
  table: "con_crew_assignments",
  title: "Resource Planning",
  eyebrow: "Operations",
  icon: Users,
  itemName: "assignment",
  noCreatedBy: true,
  orderBy: { column: "start_date", ascending: false },
  searchable: ["role", "notes"],
  kpis: (rows) => [
    { label: "Assignments", value: rows.length, icon: Users },
    { label: "Active", value: rows.filter((r) => r.status === "active").length, icon: Users },
    { label: "Jobs staffed", value: new Set(rows.map((r) => r.job_id).filter(Boolean)).size, icon: Users },
    { label: "People deployed", value: new Set(rows.map((r) => r.user_id).filter(Boolean)).size, icon: Users },
  ],
  columns: [
    { key: "user_id", label: "Person", render: (r, c) => <UserCell userId={r.user_id} profiles={c.profiles} /> },
    { key: "job_id", label: "Job", render: (r, c) => <JobCell jobId={r.job_id} jobs={c.jobs} /> },
    { key: "role", label: "Role" },
    { key: "start_date", label: "Start", render: (r) => <DateCell date={r.start_date} /> },
    { key: "end_date", label: "End", render: (r) => <DateCell date={r.end_date} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "user_id", label: "Person", type: "user" },
    { key: "job_id", label: "Job", type: "job" },
    { key: "role", label: "Role on job", type: "text", placeholder: "Foreman, Carpenter, Operator" },
    { key: "start_date", label: "Start date", type: "date" },
    { key: "end_date", label: "End date", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["planned", "active", "complete"].map((v) => ({ value: v, label: v })) },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  defaults: { status: "planned" },
};

export const Route = createFileRoute("/_hq/resource-planning")({
  head: () => ({ meta: [{ title: "Resource Planning — McGuire HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
