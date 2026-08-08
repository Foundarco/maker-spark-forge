import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, JobCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STATUS = { available: "border-emerald-200 bg-emerald-50 text-emerald-700", in_use: "border-blue-200 bg-blue-50 text-blue-700", maintenance: "border-amber-200 bg-amber-50 text-amber-700", down: "border-red-200 bg-red-50 text-red-700" };

const cfg: ResourceConfig<any> = {
  table: "con_equipment",
  title: "Equipment & Fleet",
  eyebrow: "Field Ops",
  icon: Truck,
  itemName: "asset",
  noCreatedBy: true,
  orderBy: { column: "name", ascending: true },
  searchable: ["name", "asset_tag", "category", "make", "model"],
  kpis: (rows) => [
    { label: "Assets", value: rows.length, icon: Truck },
    { label: "In use", value: rows.filter((r) => r.status === "in_use").length, icon: Truck },
    { label: "Down / service", value: rows.filter((r) => r.status === "down" || r.status === "maintenance").length, icon: Truck },
    { label: "Fleet value", value: `$${rows.reduce((s, r) => s + Number(r.purchase_cost || 0), 0).toLocaleString()}`, icon: Truck },
  ],
  columns: [
    { key: "name", label: "Asset", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "asset_tag", label: "Tag", render: (r) => <span className="font-mono text-xs">{r.asset_tag ?? "—"}</span> },
    { key: "category", label: "Category" },
    { key: "job_id", label: "On job", render: (r, c) => <JobCell jobId={r.job_id} jobs={c.jobs} /> },
    { key: "assigned_to", label: "Operator", render: (r, c) => <UserCell userId={r.assigned_to} profiles={c.profiles} /> },
    { key: "next_service_date", label: "Next service", render: (r) => <DateCell date={r.next_service_date} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "name", label: "Asset name", type: "text", required: true },
    { key: "asset_tag", label: "Asset tag", type: "text" },
    { key: "category", label: "Category", type: "select", options: ["Excavator", "Loader", "Truck", "Trailer", "Lift", "Compaction", "Small tools", "Other"].map((v) => ({ value: v, label: v })) },
    { key: "make", label: "Make", type: "text" },
    { key: "model", label: "Model", type: "text" },
    { key: "year", label: "Year", type: "number" },
    { key: "job_id", label: "Assigned job", type: "job" },
    { key: "assigned_to", label: "Operator", type: "user" },
    { key: "hours_meter", label: "Hour meter", type: "number" },
    { key: "odometer", label: "Odometer", type: "number" },
    { key: "next_service_date", label: "Next service date", type: "date" },
    { key: "purchase_cost", label: "Purchase cost", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["available", "in_use", "maintenance", "down"].map((v) => ({ value: v, label: v })) },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  defaults: { status: "available" },
};

export const Route = createFileRoute("/_hq/equipment")({
  head: () => ({ meta: [{ title: "Equipment & Fleet — McGuire HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
