import { createFileRoute } from "@tanstack/react-router";
import { PackageCheck } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, JobCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STATUS = { scheduled: "border-blue-200 bg-blue-50 text-blue-700", received: "border-emerald-200 bg-emerald-50 text-emerald-700", partial: "border-amber-200 bg-amber-50 text-amber-700", delayed: "border-red-200 bg-red-50 text-red-700" };

const cfg: ResourceConfig<any> = {
  table: "con_deliveries",
  title: "Shipments",
  eyebrow: "Fleet & Supply",
  icon: PackageCheck,
  itemName: "delivery",
  noCreatedBy: true,
  orderBy: { column: "expected_date", ascending: false },
  searchable: ["supplier", "material", "notes"],
  kpis: (rows) => [
    { label: "Scheduled", value: rows.filter((r) => r.status === "scheduled").length, icon: PackageCheck },
    { label: "Received", value: rows.filter((r) => r.status === "received").length, icon: PackageCheck },
    { label: "Delayed", value: rows.filter((r) => r.status === "delayed").length, icon: PackageCheck },
    { label: "Total", value: rows.length, icon: PackageCheck },
  ],
  columns: [
    { key: "material", label: "Material", render: (r) => <span className="font-medium">{r.material}</span> },
    { key: "supplier", label: "Supplier" },
    { key: "job_id", label: "Job", render: (r, c) => <JobCell jobId={r.job_id} jobs={c.jobs} /> },
    { key: "quantity", label: "Qty", render: (r) => <span className="font-mono text-xs">{Number(r.quantity || 0).toLocaleString()} {r.unit ?? ""}</span> },
    { key: "expected_date", label: "Expected", render: (r) => <DateCell date={r.expected_date} /> },
    { key: "received_date", label: "Received", render: (r) => <DateCell date={r.received_date} /> },
    { key: "received_by", label: "Signed by", render: (r, c) => <UserCell userId={r.received_by} profiles={c.profiles} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "material", label: "Material", type: "text", required: true, full: true },
    { key: "supplier", label: "Supplier", type: "text" },
    { key: "job_id", label: "Job", type: "job" },
    { key: "quantity", label: "Quantity", type: "number" },
    { key: "unit", label: "Unit", type: "select", options: ["ea", "sf", "lf", "cy", "ton", "pallet", "load"].map((v) => ({ value: v, label: v })) },
    { key: "expected_date", label: "Expected", type: "date" },
    { key: "received_date", label: "Received", type: "date" },
    { key: "received_by", label: "Received by", type: "user" },
    { key: "status", label: "Status", type: "select", options: ["scheduled", "partial", "received", "delayed"].map((v) => ({ value: v, label: v })) },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  defaults: { status: "scheduled" },
};

export const Route = createFileRoute("/_hq/deliveries")({
  head: () => ({ meta: [{ title: "Shipments — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
