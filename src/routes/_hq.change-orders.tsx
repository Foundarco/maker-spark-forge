import { createFileRoute } from "@tanstack/react-router";
import { GitPullRequestArrow } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, JobCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STATUS = { draft: "border-border bg-muted/40 text-muted-foreground", submitted: "border-blue-200 bg-blue-50 text-blue-700", approved: "border-emerald-200 bg-emerald-50 text-emerald-700", rejected: "border-red-200 bg-red-50 text-red-700" };

const cfg: ResourceConfig<any> = {
  table: "con_change_orders",
  title: "Change Orders",
  eyebrow: "Funding",
  icon: GitPullRequestArrow,
  itemName: "change order",
  noCreatedBy: true,
  orderBy: { column: "created_at", ascending: false },
  searchable: ["co_number", "title", "scope", "reason", "requested_by"],
  kpis: (rows) => [
    { label: "Open", value: rows.filter((r) => r.status === "submitted" || r.status === "draft").length, icon: GitPullRequestArrow },
    { label: "Approved value", value: `$${rows.filter((r) => r.status === "approved").reduce((s, r) => s + Number(r.cost_delta || 0), 0).toLocaleString()}`, icon: GitPullRequestArrow },
    { label: "Pending value", value: `$${rows.filter((r) => r.status !== "approved").reduce((s, r) => s + Number(r.cost_delta || 0), 0).toLocaleString()}`, icon: GitPullRequestArrow },
    { label: "Added days", value: rows.reduce((s, r) => s + Number(r.days_delta || 0), 0), icon: GitPullRequestArrow },
  ],
  columns: [
    { key: "co_number", label: "CO #", render: (r) => <span className="font-mono text-xs">{r.co_number ?? "—"}</span> },
    { key: "title", label: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "job_id", label: "Job", render: (r, c) => <JobCell jobId={r.job_id} jobs={c.jobs} /> },
    { key: "cost_delta", label: "Cost impact", render: (r) => <span className={`font-mono ${Number(r.cost_delta || 0) < 0 ? "text-emerald-600" : ""}`}>${Number(r.cost_delta || 0).toLocaleString()}</span> },
    { key: "days_delta", label: "Days", render: (r) => <span className="font-mono text-xs">{r.days_delta ?? 0}</span> },
    { key: "approved_by", label: "Approver", render: (r, c) => <UserCell userId={r.approved_by} profiles={c.profiles} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "title", label: "Title", type: "text", required: true, full: true },
    { key: "co_number", label: "CO number", type: "text", placeholder: "CO-001" },
    { key: "job_id", label: "Job", type: "job" },
    { key: "cost_delta", label: "Cost impact ($)", type: "number" },
    { key: "days_delta", label: "Schedule impact (days)", type: "number" },
    { key: "requested_by", label: "Requested by", type: "text" },
    { key: "approved_by", label: "Approver", type: "user" },
    { key: "status", label: "Status", type: "select", options: ["draft", "submitted", "approved", "rejected"].map((v) => ({ value: v, label: v })) },
    { key: "scope", label: "Scope of change", type: "textarea" },
    { key: "reason", label: "Reason", type: "textarea" },
  ],
  defaults: { status: "draft" },
};

export const Route = createFileRoute("/_hq/change-orders")({
  head: () => ({ meta: [{ title: "Change Orders — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
