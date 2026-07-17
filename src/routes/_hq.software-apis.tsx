import { createFileRoute } from "@tanstack/react-router";
import { Terminal, Boxes, Activity, Rocket } from "lucide-react";
import { ResourcePage, StatusBadge, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "dev_software",
  title: "Software & APIs",
  eyebrow: "Development",
  icon: Terminal,
  itemName: "service",
  orderBy: { column: "name", ascending: true },
  searchable: ["name", "kind", "environment", "description"],
  defaults: { kind: "service", environment: "production", status: "active" },
  kpis: (rows) => [
    { label: "Services", value: rows.length, icon: Boxes },
    { label: "Production", value: rows.filter((r) => r.environment === "production").length, icon: Rocket },
    { label: "Active", value: rows.filter((r) => r.status === "active").length, icon: Activity },
    { label: "APIs", value: rows.filter((r) => r.kind === "api").length, icon: Terminal },
  ],
  columns: [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "kind", label: "Kind", render: (r) => <StatusBadge value={r.kind} /> },
    { key: "environment", label: "Env", render: (r) => <StatusBadge value={r.environment} /> },
    { key: "version", label: "Version" },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={{ active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", degraded: "border-amber-500/20 bg-amber-500/10 text-amber-600", down: "border-destructive/20 bg-destructive/10 text-destructive" }} /> },
  ],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "kind", label: "Kind", type: "select", options: ["service","api","cli","library","worker","frontend"].map((v) => ({ value: v, label: v })) },
    { key: "environment", label: "Environment", type: "select", options: ["production","staging","development"].map((v) => ({ value: v, label: v })) },
    { key: "version", label: "Version", type: "text" },
    { key: "url", label: "URL", type: "text", full: true },
    { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "degraded", label: "Degraded" }, { value: "down", label: "Down" }, { value: "retired", label: "Retired" }] },
    { key: "owner_id", label: "Owner", type: "user" },
    { key: "description", label: "Description", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/software-apis")({
  head: () => ({ meta: [{ title: "Software & APIs — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
