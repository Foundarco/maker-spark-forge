import { createFileRoute, Link } from "@tanstack/react-router";
import { HardHat } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, ClientCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STAGE = {
  lead: "border-border bg-muted/40 text-muted-foreground",
  preconstruction: "border-blue-200 bg-blue-50 text-blue-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  closeout: "border-amber-200 bg-amber-50 text-amber-700",
  complete: "border-border bg-muted/40 text-muted-foreground",
};

const cfg: ResourceConfig<any> = {
  table: "con_jobs",
  title: "Jobs",
  eyebrow: "Field Ops",
  icon: HardHat,
  itemName: "job",
  orderBy: { column: "created_at", ascending: false },
  searchable: ["job_number", "name", "address", "city", "job_type", "division"],
  kpis: (rows) => [
    { label: "Active jobs", value: rows.filter((r) => r.stage === "active").length, icon: HardHat },
    { label: "Contract value", value: `$${rows.reduce((s, r) => s + Number(r.contract_value || 0), 0).toLocaleString()}`, icon: HardHat },
    { label: "Cost to date", value: `$${rows.reduce((s, r) => s + Number(r.actual_cost || 0), 0).toLocaleString()}`, icon: HardHat },
    { label: "Avg complete", value: `${Math.round(rows.reduce((s, r) => s + Number(r.percent_complete || 0), 0) / (rows.length || 1))}%`, icon: HardHat },
  ],
  columns: [
    {
      key: "job_number",
      label: "Job",
      render: (r) => (
        <Link to="/jobs/$id" params={{ id: r.id }} className="block">
          <span className="font-mono text-[11px] text-muted-foreground">{r.job_number ?? "—"}</span>
          <span className="block font-medium text-primary hover:underline">{r.name}</span>
        </Link>
      ),
    },
    { key: "client_id", label: "Client", render: (r, c) => <ClientCell clientId={r.client_id} clients={c.clients} /> },
    { key: "city", label: "Location", render: (r) => <span className="text-xs text-muted-foreground">{[r.city, r.state].filter(Boolean).join(", ") || "—"}</span> },
    { key: "division", label: "Division" },
    { key: "project_manager_id", label: "PM", render: (r, c) => <UserCell userId={r.project_manager_id} profiles={c.profiles} /> },
    { key: "contract_value", label: "Contract", render: (r) => <span className="font-mono">${Number(r.contract_value || 0).toLocaleString()}</span> },
    {
      key: "percent_complete",
      label: "Progress",
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Number(r.percent_complete || 0))}%` }} />
          </div>
          <span className="font-mono text-[11px]">{Number(r.percent_complete || 0)}%</span>
        </div>
      ),
    },
    { key: "target_end_date", label: "Target", render: (r) => <DateCell date={r.target_end_date} /> },
    { key: "stage", label: "Stage", render: (r) => <StatusBadge value={r.stage} palette={STAGE} /> },
  ],
  fields: [
    { key: "name", label: "Job name", type: "text", required: true, full: true },
    { key: "job_number", label: "Job number", type: "text", placeholder: "24-118" },
    { key: "client_id", label: "Client", type: "client" },
    { key: "job_type", label: "Job type", type: "select", options: ["Commercial", "Residential", "Renovation", "Tenant improvement", "Site work", "Service"].map((v) => ({ value: v, label: v })) },
    { key: "division", label: "Division", type: "select", options: ["Construction", "Concrete", "Excavation", "Landscape", "Development"].map((v) => ({ value: v, label: v })) },
    { key: "address", label: "Address", type: "text", full: true },
    { key: "city", label: "City", type: "text" },
    { key: "state", label: "State", type: "text" },
    { key: "zip", label: "ZIP", type: "text" },
    { key: "project_manager_id", label: "Project manager", type: "user" },
    { key: "superintendent_id", label: "Superintendent", type: "user" },
    { key: "contract_value", label: "Contract value", type: "number" },
    { key: "estimated_cost", label: "Estimated cost", type: "number" },
    { key: "actual_cost", label: "Cost to date", type: "number" },
    { key: "billed", label: "Billed to date", type: "number" },
    { key: "percent_complete", label: "% complete", type: "number" },
    { key: "start_date", label: "Start date", type: "date" },
    { key: "target_end_date", label: "Target completion", type: "date" },
    { key: "actual_end_date", label: "Actual completion", type: "date" },
    { key: "stage", label: "Stage", type: "select", options: ["lead", "preconstruction", "active", "closeout", "complete"].map((v) => ({ value: v, label: v })) },
    { key: "description", label: "Scope summary", type: "textarea" },
  ],
  defaults: { stage: "preconstruction", percent_complete: 0 },
};

export const Route = createFileRoute("/_hq/jobs/")({
  head: () => ({ meta: [{ title: "Jobs — McGuire HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
