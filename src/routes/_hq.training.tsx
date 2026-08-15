import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STATUS = {
  assigned: "border-border bg-muted/40 text-muted-foreground",
  in_progress: "border-blue-200 bg-blue-50 text-blue-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  expired: "border-red-200 bg-red-50 text-red-700",
};

const cfg: ResourceConfig<any> = {
  table: "hr_training",
  title: "Training",
  eyebrow: "People",
  icon: GraduationCap,
  itemName: "training record",
  noCreatedBy: true,
  orderBy: { column: "completed_date", ascending: false },
  searchable: ["course", "category", "instructor", "score"],
  kpis: (rows) => [
    { label: "Records", value: rows.length, icon: GraduationCap },
    { label: "Completed", value: rows.filter((r) => r.status === "completed").length, icon: GraduationCap },
    { label: "Outstanding required", value: rows.filter((r) => r.required && r.status !== "completed").length, icon: GraduationCap },
    { label: "Trained staff", value: new Set(rows.map((r) => r.user_id).filter(Boolean)).size, icon: GraduationCap },
  ],
  columns: [
    { key: "course", label: "Course", render: (r) => <span className="font-medium">{r.course}</span> },
    { key: "user_id", label: "Employee", render: (r, c) => <UserCell userId={r.user_id} profiles={c.profiles} /> },
    { key: "category", label: "Category" },
    { key: "required", label: "Required", render: (r) => (r.required ? "Yes" : "No") },
    { key: "instructor", label: "Instructor" },
    { key: "completed_date", label: "Completed", render: (r) => <DateCell date={r.completed_date} /> },
    { key: "expires_date", label: "Expires", render: (r) => <DateCell date={r.expires_date} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "course", label: "Course", type: "text", required: true, full: true },
    { key: "user_id", label: "Employee", type: "user" },
    { key: "category", label: "Category", type: "select", options: ["Safety", "Equipment", "Compliance", "Trade skills", "Leadership", "Software"].map((v) => ({ value: v, label: v })) },
    { key: "required", label: "Required training", type: "bool" },
    { key: "instructor", label: "Instructor / provider", type: "text" },
    { key: "completed_date", label: "Completed", type: "date" },
    { key: "expires_date", label: "Expires", type: "date" },
    { key: "score", label: "Score / result", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["assigned", "in_progress", "completed", "expired"].map((v) => ({ value: v, label: v })) },
    { key: "document_url", label: "Certificate URL", type: "text", full: true },
  ],
  defaults: { status: "assigned", required: false },
};

export const Route = createFileRoute("/_hq/training")({
  head: () => ({ meta: [{ title: "Training — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
