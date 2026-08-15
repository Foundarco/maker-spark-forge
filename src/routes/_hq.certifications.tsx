import { createFileRoute } from "@tanstack/react-router";
import { Award } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STATUS = { active: "border-emerald-200 bg-emerald-50 text-emerald-700", expiring: "border-amber-200 bg-amber-50 text-amber-700", expired: "border-red-200 bg-red-50 text-red-700" };

const soon = (d: string | null) => !!d && new Date(d).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 60;

const cfg: ResourceConfig<any> = {
  table: "hr_certifications",
  title: "Certifications",
  eyebrow: "People",
  icon: Award,
  itemName: "certification",
  noCreatedBy: true,
  orderBy: { column: "expires_date", ascending: true },
  searchable: ["name", "issuer", "notes"],
  kpis: (rows) => [
    { label: "Certifications", value: rows.length, icon: Award },
    { label: "Expiring < 60d", value: rows.filter((r) => soon(r.expires_date) && r.status !== "expired").length, icon: Award },
    { label: "Expired", value: rows.filter((r) => r.expires_date && new Date(r.expires_date) < new Date()).length, icon: Award },
    { label: "Certified staff", value: new Set(rows.map((r) => r.user_id).filter(Boolean)).size, icon: Award },
  ],
  columns: [
    { key: "name", label: "Certification", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "user_id", label: "Employee", render: (r, c) => <UserCell userId={r.user_id} profiles={c.profiles} /> },
    { key: "issuer", label: "Issuer" },
    { key: "issue_date", label: "Issued", render: (r) => <DateCell date={r.issue_date} /> },
    { key: "expires_date", label: "Expires", render: (r) => <DateCell date={r.expires_date} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "name", label: "Certification", type: "text", required: true, full: true },
    { key: "user_id", label: "Employee", type: "user" },
    { key: "issuer", label: "Issuing body", type: "text", placeholder: "OSHA, NCCER, State" },
    { key: "issue_date", label: "Issue date", type: "date" },
    { key: "expires_date", label: "Expiration", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["active", "expiring", "expired"].map((v) => ({ value: v, label: v })) },
    { key: "document_url", label: "Document URL", type: "text", full: true },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  defaults: { status: "active" },
};

export const Route = createFileRoute("/_hq/certifications")({
  head: () => ({ meta: [{ title: "Certifications — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
