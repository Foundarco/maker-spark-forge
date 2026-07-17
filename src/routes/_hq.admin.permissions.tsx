import { createFileRoute } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "admin_permission_overrides",
  title: "Permission Overrides",
  eyebrow: "Administration",
  icon: KeyRound,
  itemName: "override",
  orderBy: { column: "created_at", ascending: false },
  searchable: ["permission", "notes"],
  defaults: { granted: true },
  kpis: (rows) => [
    { label: "Overrides", value: rows.length, icon: KeyRound },
    { label: "Granted", value: rows.filter((r) => r.granted).length, icon: KeyRound },
    { label: "Denied", value: rows.filter((r) => !r.granted).length, icon: KeyRound },
  ],
  columns: [
    { key: "user_id", label: "User", render: (r, ctx) => <UserCell userId={r.user_id} profiles={ctx.profiles} /> },
    { key: "permission", label: "Permission", render: (r) => <span className="font-mono text-xs">{r.permission}</span> },
    { key: "granted", label: "Effect", render: (r) => <StatusBadge value={r.granted ? "granted" : "denied"} palette={{ granted: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", denied: "border-destructive/20 bg-destructive/10 text-destructive" }} /> },
    { key: "notes", label: "Notes" },
    { key: "created_at", label: "Set", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "user_id", label: "User", type: "user", required: true },
    { key: "permission", label: "Permission", type: "select", required: true, options: ["manage_channels","manage_roles","manage_messages","manage_users","manage_billing","manage_domains","view_financials","export_data","admin"].map((v) => ({ value: v, label: v })) },
    { key: "granted", label: "Granted", type: "bool", placeholder: "Grant (uncheck to deny)" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/admin/permissions")({
  head: () => ({ meta: [{ title: "Permissions — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
