import { createFileRoute } from "@tanstack/react-router";
import { Handshake } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STATUS = { approved: "border-emerald-200 bg-emerald-50 text-emerald-700", pending: "border-amber-200 bg-amber-50 text-amber-700", suspended: "border-red-200 bg-red-50 text-red-700" };

const cfg: ResourceConfig<any> = {
  table: "con_subcontractors",
  title: "Fabrication Partners",
  eyebrow: "Fleet & Supply",
  icon: Handshake,
  itemName: "subcontractor",
  noCreatedBy: true,
  orderBy: { column: "name", ascending: true },
  searchable: ["name", "trade", "contact_name", "email", "license_number"],
  kpis: (rows) => [
    { label: "Subs", value: rows.length, icon: Handshake },
    { label: "Approved", value: rows.filter((r) => r.status === "approved").length, icon: Handshake },
    { label: "Missing W-9", value: rows.filter((r) => !r.w9_on_file).length, icon: Handshake },
    { label: "Trades", value: new Set(rows.map((r) => r.trade).filter(Boolean)).size, icon: Handshake },
  ],
  columns: [
    { key: "name", label: "Company", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "trade", label: "Trade" },
    { key: "contact_name", label: "Contact" },
    { key: "phone", label: "Phone" },
    { key: "insurance_expires", label: "Insurance exp.", render: (r) => <DateCell date={r.insurance_expires} /> },
    { key: "w9_on_file", label: "W-9", render: (r) => <span className="text-xs">{r.w9_on_file ? "On file" : "Missing"}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "name", label: "Company", type: "text", required: true },
    { key: "trade", label: "Trade", type: "text" },
    { key: "contact_name", label: "Contact name", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "license_number", label: "License #", type: "text" },
    { key: "insurance_expires", label: "Insurance expires", type: "date" },
    { key: "w9_on_file", label: "W-9 on file", type: "bool", placeholder: "Received" },
    { key: "rating", label: "Rating (1-5)", type: "number" },
    { key: "hourly_rate", label: "Hourly rate", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["approved", "pending", "suspended"].map((v) => ({ value: v, label: v })) },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  defaults: { status: "pending" },
};

export const Route = createFileRoute("/_hq/subcontractors")({
  head: () => ({ meta: [{ title: "Fabrication Partners — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
