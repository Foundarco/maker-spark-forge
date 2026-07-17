import { createFileRoute } from "@tanstack/react-router";
import { Server, Activity, AlertTriangle, Cloud } from "lucide-react";
import { ResourcePage, StatusBadge, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "dev_infrastructure",
  title: "Infrastructure & Monitoring",
  eyebrow: "Development",
  icon: Server,
  itemName: "resource",
  orderBy: { column: "name", ascending: true },
  searchable: ["name", "kind", "provider", "region", "notes"],
  defaults: { kind: "server", environment: "production", status: "healthy" },
  kpis: (rows) => [
    { label: "Resources", value: rows.length, icon: Server },
    { label: "Healthy", value: rows.filter((r) => r.status === "healthy").length, icon: Activity },
    { label: "Issues", value: rows.filter((r) => ["degraded","down"].includes(r.status)).length, icon: AlertTriangle },
    { label: "Providers", value: new Set(rows.map((r) => r.provider).filter(Boolean)).size, icon: Cloud },
  ],
  columns: [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "kind", label: "Kind", render: (r) => <StatusBadge value={r.kind} /> },
    { key: "provider", label: "Provider" },
    { key: "region", label: "Region" },
    { key: "environment", label: "Env", render: (r) => <StatusBadge value={r.environment} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={{ healthy: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", degraded: "border-amber-500/20 bg-amber-500/10 text-amber-600", down: "border-destructive/20 bg-destructive/10 text-destructive" }} /> },
  ],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "kind", label: "Kind", type: "select", options: ["server","database","cache","queue","cdn","function","storage"].map((v) => ({ value: v, label: v })) },
    { key: "provider", label: "Provider", type: "text" },
    { key: "region", label: "Region", type: "text" },
    { key: "environment", label: "Environment", type: "select", options: ["production","staging","development"].map((v) => ({ value: v, label: v })) },
    { key: "status", label: "Status", type: "select", options: [{ value: "healthy", label: "Healthy" }, { value: "degraded", label: "Degraded" }, { value: "down", label: "Down" }, { value: "maintenance", label: "Maintenance" }] },
    { key: "url", label: "URL", type: "text", full: true },
    { key: "owner_id", label: "Owner", type: "user" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/it-servers")({
  head: () => ({ meta: [{ title: "Infrastructure & Monitoring — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
