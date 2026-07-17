import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { ResourcePage, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "admin_settings",
  title: "Security Policies",
  eyebrow: "Administration",
  icon: Shield,
  itemName: "policy",
  baseFilter: { category: "security" },
  defaults: { category: "security" },
  orderBy: { column: "key", ascending: true },
  searchable: ["key", "value", "description"],
  kpis: (rows) => [{ label: "Policies", value: rows.length, icon: Shield }],
  columns: [
    { key: "key", label: "Policy", render: (r) => <span className="font-medium">{r.key}</span> },
    { key: "value", label: "Value", render: (r) => <span className="font-mono text-xs">{r.value || "—"}</span> },
    { key: "description", label: "Description" },
  ],
  fields: [
    { key: "key", label: "Policy", type: "select", required: true, options: ["password_min_length","password_require_symbols","mfa_required","session_timeout_minutes","idle_lock_minutes","allowed_ip_ranges","sso_only","password_rotation_days"].map((v) => ({ value: v, label: v })) },
    { key: "value", label: "Value", type: "text", full: true },
    { key: "description", label: "Description", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/admin/security")({
  head: () => ({ meta: [{ title: "Security — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
