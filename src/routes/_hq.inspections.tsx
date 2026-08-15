import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, JobCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const RESULT = { pass: "border-emerald-200 bg-emerald-50 text-emerald-700", fail: "border-red-200 bg-red-50 text-red-700", conditional: "border-amber-200 bg-amber-50 text-amber-700" };

const cfg: ResourceConfig<any> = {
  table: "con_inspections",
  title: "Field Trials",
  eyebrow: "Mission Ops",
  icon: ClipboardCheck,
  itemName: "inspection",
  noCreatedBy: true,
  orderBy: { column: "scheduled_date", ascending: false },
  searchable: ["inspection_type", "inspector", "notes"],
  kpis: (rows) => [
    { label: "Scheduled", value: rows.filter((r) => r.status === "scheduled").length, icon: ClipboardCheck },
    { label: "Passed", value: rows.filter((r) => r.result === "pass").length, icon: ClipboardCheck },
    { label: "Failed", value: rows.filter((r) => r.result === "fail").length, icon: ClipboardCheck },
    { label: "Total", value: rows.length, icon: ClipboardCheck },
  ],
  columns: [
    { key: "inspection_type", label: "Inspection", render: (r) => <span className="font-medium">{r.inspection_type}</span> },
    { key: "job_id", label: "Job", render: (r, c) => <JobCell jobId={r.job_id} jobs={c.jobs} /> },
    { key: "scheduled_date", label: "Scheduled", render: (r) => <DateCell date={r.scheduled_date} /> },
    { key: "completed_date", label: "Completed", render: (r) => <DateCell date={r.completed_date} /> },
    { key: "inspector", label: "Inspector" },
    { key: "result", label: "Result", render: (r) => <StatusBadge value={r.result} palette={RESULT} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ],
  fields: [
    { key: "inspection_type", label: "Inspection type", type: "text", required: true },
    { key: "job_id", label: "Job", type: "job" },
    { key: "scheduled_date", label: "Scheduled", type: "date" },
    { key: "completed_date", label: "Completed", type: "date" },
    { key: "inspector", label: "Inspector name", type: "text" },
    { key: "inspector_id", label: "Internal QC lead", type: "user" },
    { key: "result", label: "Result", type: "select", options: ["pass", "conditional", "fail"].map((v) => ({ value: v, label: v })) },
    { key: "status", label: "Status", type: "select", options: ["scheduled", "completed", "cancelled"].map((v) => ({ value: v, label: v })) },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  defaults: { status: "scheduled" },
};

export const Route = createFileRoute("/_hq/inspections")({
  head: () => ({ meta: [{ title: "Field Trials — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
