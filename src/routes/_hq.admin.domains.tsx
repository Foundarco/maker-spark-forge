import { createFileRoute } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "admin_domains",
  title: "Domains",
  eyebrow: "Administration",
  icon: Globe,
  itemName: "domain",
  orderBy: { column: "created_at", ascending: false },
  searchable: ["domain", "purpose", "notes"],
  kpis: (rows) => [
    { label: "Domains", value: rows.length, icon: Globe },
    { label: "Verified", value: rows.filter((r) => r.verified).length, icon: Globe },
    { label: "SSL active", value: rows.filter((r) => r.ssl_active).length, icon: Globe },
  ],
  columns: [
    { key: "domain", label: "Domain", render: (r) => <span className="font-mono font-medium">{r.domain}</span> },
    { key: "purpose", label: "Purpose", render: (r) => <StatusBadge value={r.purpose} /> },
    { key: "verified", label: "Verified", render: (r) => <StatusBadge value={r.verified ? "verified" : "pending"} palette={{ verified: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", pending: "border-amber-500/20 bg-amber-500/10 text-amber-600" }} /> },
    { key: "ssl_active", label: "SSL", render: (r) => <StatusBadge value={r.ssl_active ? "active" : "off"} palette={{ active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", off: "border-border bg-muted/40" }} /> },
    { key: "created_at", label: "Added", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "domain", label: "Domain", type: "text", required: true, placeholder: "example.com" },
    { key: "purpose", label: "Purpose", type: "select", options: ["website","email","hq","staging","api","redirect"].map((v) => ({ value: v, label: v })) },
    { key: "verified", label: "Verified", type: "bool" },
    { key: "ssl_active", label: "SSL active", type: "bool" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/admin/domains")({
  head: () => ({ meta: [{ title: "Domains — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
