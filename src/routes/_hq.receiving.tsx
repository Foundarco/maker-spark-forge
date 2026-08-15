import { createFileRoute } from "@tanstack/react-router";
import { PackageOpen } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, JobCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STATUS = {
  scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  partial: "border-amber-200 bg-amber-50 text-amber-700",
  received: "border-emerald-200 bg-emerald-50 text-emerald-700",
  delayed: "border-red-200 bg-red-50 text-red-700",
};

const overdue = (r: any) => r.status !== "received" && r.expected_date && new Date(r.expected_date) < new Date();

const cfg: ResourceConfig<any> = {
  table: "con_deliveries",
  title: "Receiving",
  eyebrow: "Fleet & Supply",
  icon: PackageOpen,
  itemName: "receipt",
  noCreatedBy: true,
  orderBy: { column: "expected_date", ascending: true },
  searchable: ["material", "supplier", "notes"],
  kpis: (rows) => [
    { label: "Awaiting receipt", value: rows.filter((r) => r.status !== "received").length, icon: PackageOpen },
    { label: "Overdue", value: rows.filter(overdue).length, icon: PackageOpen },
    { label: "Received (all time)", value: rows.filter((r) => r.status === "received").length, icon: PackageOpen },
    { label: "Unsigned receipts", value: rows.filter((r) => r.status === "received" && !r.received_by).length, icon: PackageOpen },
  ],
  columns: [
    { key: "material", label: "Material", render: (r) => <span className="font-medium">{r.material}</span> },
    { key: "supplier", label: "Supplier" },
    { key: "job_id", label: "Job", render: (r, c) => <JobCell jobId={r.job_id} jobs={c.jobs} /> },
    { key: "expected_date", label: "Expected", render: (r) => <span className={overdue(r) ? "text-red-600" : undefined}><DateCell date={r.expected_date} /></span> },
    { key: "received_date", label: "Received", render: (r) => <DateCell date={r.received_date} /> },
    { key: "quantity", label: "Qty", render: (r) => <span className="font-mono text-xs">{Number(r.quantity || 0).toLocaleString()} {r.unit ?? ""}</span> },
    { key: "received_by", label: "Signed by", render: (r, c) => <UserCell userId={r.received_by} profiles={c.profiles} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "material", label: "Material", type: "text", required: true, full: true },
    { key: "supplier", label: "Supplier", type: "text" },
    { key: "job_id", label: "Job", type: "job" },
    { key: "quantity", label: "Quantity received", type: "number" },
    { key: "unit", label: "Unit", type: "select", options: ["ea", "sf", "lf", "cy", "ton", "pallet", "load"].map((v) => ({ value: v, label: v })) },
    { key: "expected_date", label: "Expected", type: "date" },
    { key: "received_date", label: "Date received", type: "date" },
    { key: "received_by", label: "Received by", type: "user" },
    { key: "status", label: "Status", type: "select", options: ["scheduled", "partial", "received", "delayed"].map((v) => ({ value: v, label: v })) },
    { key: "notes", label: "Condition / discrepancies", type: "textarea", full: true },
  ],
  defaults: { status: "scheduled" },
};

export const Route = createFileRoute("/_hq/receiving")({
  head: () => ({ meta: [{ title: "Receiving — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
