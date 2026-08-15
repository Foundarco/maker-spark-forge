import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, JobCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const SEV = { minor: "border-emerald-200 bg-emerald-50 text-emerald-700", moderate: "border-amber-200 bg-amber-50 text-amber-700", serious: "border-orange-200 bg-orange-50 text-orange-700", critical: "border-red-200 bg-red-50 text-red-700" };

const cfg: ResourceConfig<any> = {
  table: "con_safety_incidents",
  title: "Safety & Reports",
  eyebrow: "Mission Ops",
  icon: ShieldAlert,
  itemName: "incident",
  noCreatedBy: true,
  orderBy: { column: "incident_date", ascending: false },
  searchable: ["incident_type", "description", "corrective_action"],
  kpis: (rows) => [
    { label: "Incidents", value: rows.length, icon: ShieldAlert },
    { label: "OSHA reportable", value: rows.filter((r) => r.osha_reportable).length, icon: ShieldAlert },
    { label: "Open", value: rows.filter((r) => r.status !== "closed").length, icon: ShieldAlert },
    { label: "Lost-time hrs", value: rows.reduce((s, r) => s + Number(r.lost_time_hours || 0), 0), icon: ShieldAlert },
  ],
  columns: [
    { key: "incident_date", label: "Date", render: (r) => <DateCell date={r.incident_date} /> },
    { key: "incident_type", label: "Type", render: (r) => <span className="font-medium">{r.incident_type}</span> },
    { key: "job_id", label: "Job", render: (r, c) => <JobCell jobId={r.job_id} jobs={c.jobs} /> },
    { key: "involved_id", label: "Involved", render: (r, c) => <UserCell userId={r.involved_id} profiles={c.profiles} /> },
    { key: "severity", label: "Severity", render: (r) => <StatusBadge value={r.severity} palette={SEV} /> },
    { key: "osha_reportable", label: "OSHA", render: (r) => <span className="text-xs">{r.osha_reportable ? "Yes" : "No"}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ],
  fields: [
    { key: "incident_type", label: "Incident type", type: "select", required: true, options: ["Near miss", "First aid", "Injury", "Property damage", "Environmental", "Vehicle"].map((v) => ({ value: v, label: v })) },
    { key: "incident_date", label: "Date", type: "date", required: true },
    { key: "job_id", label: "Job", type: "job" },
    { key: "involved_id", label: "Person involved", type: "user" },
    { key: "reported_by", label: "Reported by", type: "user" },
    { key: "severity", label: "Severity", type: "select", options: ["minor", "moderate", "serious", "critical"].map((v) => ({ value: v, label: v })) },
    { key: "osha_reportable", label: "OSHA reportable", type: "bool", placeholder: "Recordable incident" },
    { key: "lost_time_hours", label: "Lost time (hrs)", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["open", "investigating", "closed"].map((v) => ({ value: v, label: v })) },
    { key: "description", label: "What happened", type: "textarea" },
    { key: "corrective_action", label: "Corrective action", type: "textarea" },
  ],
  defaults: { status: "open", severity: "minor" },
};

export const Route = createFileRoute("/_hq/safety")({
  head: () => ({ meta: [{ title: "Safety & Incidents — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
