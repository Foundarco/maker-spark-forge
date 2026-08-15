import { createFileRoute } from "@tanstack/react-router";
import { FileSignature } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, JobCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "con_documents",
  title: "Grants & Proposals",
  eyebrow: "Engineering",
  icon: FileSignature,
  itemName: "document",
  noCreatedBy: true,
  baseFilter: { doc_type: "contract" },
  orderBy: { column: "created_at", ascending: false },
  searchable: ["title", "version", "notes"],
  kpis: (rows) => [
    { label: "Documents", value: rows.length, icon: FileSignature },
    { label: "Current versions", value: rows.filter((r) => r.is_latest).length, icon: FileSignature },
    { label: "Superseded", value: rows.filter((r) => !r.is_latest).length, icon: FileSignature },
  ],
  columns: [
    { key: "title", label: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "job_id", label: "Job", render: (r, c) => <JobCell jobId={r.job_id} jobs={c.jobs} /> },
    { key: "version", label: "Version", render: (r) => <span className="font-mono text-xs">{r.version ?? "v1"}</span> },
    { key: "is_latest", label: "Status", render: (r) => <StatusBadge value={r.is_latest ? "current" : "superseded"} palette={{ current: "border-emerald-200 bg-emerald-50 text-emerald-700", superseded: "border-border bg-muted/40 text-muted-foreground" }} /> },
    { key: "created_at", label: "Added", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "title", label: "Title", type: "text", required: true, full: true },
    { key: "job_id", label: "Job", type: "job" },
    { key: "version", label: "Version", type: "text", placeholder: "v1.0" },
    { key: "is_latest", label: "Current version", type: "bool", placeholder: "This is the active version" },
    { key: "file_url", label: "File URL", type: "text", full: true },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const Route = createFileRoute("/_hq/proposals")({
  head: () => ({ meta: [{ title: "Grants & Proposals — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
