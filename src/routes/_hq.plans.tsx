import { createFileRoute } from "@tanstack/react-router";
import { Map } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, JobCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "con_documents",
  title: "CAD & Drawings",
  eyebrow: "Engineering",
  icon: Map,
  itemName: "drawing",
  noCreatedBy: true,
  baseFilter: { doc_type: "drawing" },
  orderBy: { column: "created_at", ascending: false },
  searchable: ["title", "version", "notes"],
  kpis: (rows) => [
    { label: "Sheets", value: rows.length, icon: Map },
    { label: "Current", value: rows.filter((r) => r.is_latest).length, icon: Map },
    { label: "Jobs covered", value: new Set(rows.map((r) => r.job_id).filter(Boolean)).size, icon: Map },
  ],
  columns: [
    { key: "title", label: "Sheet", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "job_id", label: "Job", render: (r, c) => <JobCell jobId={r.job_id} jobs={c.jobs} /> },
    { key: "version", label: "Rev", render: (r) => <span className="font-mono text-xs">{r.version ?? "A"}</span> },
    { key: "is_latest", label: "Status", render: (r) => <StatusBadge value={r.is_latest ? "current" : "superseded"} palette={{ current: "border-emerald-200 bg-emerald-50 text-emerald-700", superseded: "border-border bg-muted/40 text-muted-foreground" }} /> },
    { key: "created_at", label: "Issued", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "title", label: "Sheet title", type: "text", required: true, full: true },
    { key: "job_id", label: "Job", type: "job" },
    { key: "version", label: "Revision", type: "text", placeholder: "Rev A" },
    { key: "is_latest", label: "Current revision", type: "bool", placeholder: "Latest issued set" },
    { key: "file_url", label: "File URL", type: "text", full: true },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const Route = createFileRoute("/_hq/plans")({
  head: () => ({ meta: [{ title: "CAD & Drawings — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
