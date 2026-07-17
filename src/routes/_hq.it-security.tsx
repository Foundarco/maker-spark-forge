import { createFileRoute } from "@tanstack/react-router";
import { Shield, AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "dev_security_logs",
  title: "Security & Logs",
  eyebrow: "Development",
  icon: Shield,
  itemName: "event",
  orderBy: { column: "occurred_at", ascending: false },
  searchable: ["event", "source", "details"],
  defaults: { severity: "info", status: "open" },
  kpis: (rows) => [
    { label: "Events", value: rows.length, icon: Shield },
    { label: "Critical", value: rows.filter((r) => r.severity === "critical").length, icon: ShieldAlert },
    { label: "Open", value: rows.filter((r) => r.status === "open").length, icon: AlertTriangle },
    { label: "Resolved", value: rows.filter((r) => r.status === "resolved").length, icon: ShieldCheck },
  ],
  columns: [
    { key: "event", label: "Event", render: (r) => <span className="font-medium">{r.event}</span> },
    { key: "severity", label: "Severity", render: (r) => <StatusBadge value={r.severity} palette={{ critical: "border-destructive/20 bg-destructive/10 text-destructive", high: "border-destructive/20 bg-destructive/10 text-destructive", medium: "border-amber-500/20 bg-amber-500/10 text-amber-600", low: "border-muted/30 bg-muted/10 text-muted-foreground", info: "border-primary/20 bg-primary/10 text-primary" }} /> },
    { key: "source", label: "Source" },
    { key: "actor_id", label: "Actor", render: (r, ctx) => <UserCell userId={r.actor_id} profiles={ctx.profiles} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={{ open: "border-amber-500/20 bg-amber-500/10 text-amber-600", investigating: "border-primary/20 bg-primary/10 text-primary", resolved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" }} /> },
    { key: "occurred_at", label: "When", render: (r) => <DateCell date={r.occurred_at} /> },
  ],
  fields: [
    { key: "event", label: "Event", type: "text", required: true },
    { key: "severity", label: "Severity", type: "select", options: [{ value: "info", label: "Info" }, { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "critical", label: "Critical" }] },
    { key: "source", label: "Source", type: "text" },
    { key: "actor_id", label: "Actor", type: "user" },
    { key: "status", label: "Status", type: "select", options: [{ value: "open", label: "Open" }, { value: "investigating", label: "Investigating" }, { value: "resolved", label: "Resolved" }, { value: "ignored", label: "Ignored" }] },
    { key: "occurred_at", label: "Occurred at", type: "date" },
    { key: "details", label: "Details", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/it-security")({
  head: () => ({ meta: [{ title: "Security & Logs — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
