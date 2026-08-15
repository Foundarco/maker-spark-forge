import { createFileRoute } from "@tanstack/react-router";
import { Stamp } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, JobCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STATUS = { applied: "border-amber-200 bg-amber-50 text-amber-700", issued: "border-emerald-200 bg-emerald-50 text-emerald-700", expired: "border-red-200 bg-red-50 text-red-700", closed: "border-border bg-muted/40 text-muted-foreground" };

const cfg: ResourceConfig<any> = {
  table: "con_permits",
  title: "Compliance & Approvals",
  eyebrow: "Engineering",
  icon: Stamp,
  itemName: "permit",
  noCreatedBy: true,
  orderBy: { column: "created_at", ascending: false },
  searchable: ["permit_type", "authority", "permit_number", "notes"],
  kpis: (rows) => [
    { label: "Issued", value: rows.filter((r) => r.status === "issued").length, icon: Stamp },
    { label: "Awaiting", value: rows.filter((r) => r.status === "applied").length, icon: Stamp },
    { label: "Fees", value: `$${rows.reduce((s, r) => s + Number(r.fee || 0), 0).toLocaleString()}`, icon: Stamp },
  ],
  columns: [
    { key: "permit_type", label: "Permit", render: (r) => <span className="font-medium">{r.permit_type}</span> },
    { key: "authority", label: "Authority" },
    { key: "permit_number", label: "Number", render: (r) => <span className="font-mono text-xs">{r.permit_number ?? "—"}</span> },
    { key: "job_id", label: "Job", render: (r, c) => <JobCell jobId={r.job_id} jobs={c.jobs} /> },
    { key: "issued_date", label: "Issued", render: (r) => <DateCell date={r.issued_date} /> },
    { key: "expires_date", label: "Expires", render: (r) => <DateCell date={r.expires_date} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "permit_type", label: "Permit type", type: "text", required: true },
    { key: "authority", label: "Issuing authority", type: "text" },
    { key: "permit_number", label: "Permit number", type: "text" },
    { key: "job_id", label: "Job", type: "job" },
    { key: "applied_date", label: "Applied", type: "date" },
    { key: "issued_date", label: "Issued", type: "date" },
    { key: "expires_date", label: "Expires", type: "date" },
    { key: "inspection_date", label: "Inspection", type: "date" },
    { key: "fee", label: "Fee", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["applied", "issued", "expired", "closed"].map((v) => ({ value: v, label: v })) },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  defaults: { status: "applied" },
};

export const Route = createFileRoute("/_hq/permits")({
  head: () => ({ meta: [{ title: "Compliance & Approvals — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
