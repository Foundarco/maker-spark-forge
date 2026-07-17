import { createFileRoute } from "@tanstack/react-router";
import { Mail, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/email-support")({
  head: () => ({ meta: [{ title: "Email Support — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS_PALETTE = {
  open: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  resolved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  closed: "border-border bg-muted/40 text-muted-foreground",
};

const config: ResourceConfig<any> = {
  table: "cs_tickets",
  title: "Email Support",
  eyebrow: "Customer Service · Email",
  icon: Mail,
  itemName: "email",
  baseFilter: { channel: "email" },
  searchable: ["subject", "customer_name", "customer_email"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => [
    { label: "Threads", value: rows.length, icon: Mail },
    { label: "Open", value: rows.filter((r) => r.status === "open").length, icon: AlertCircle },
    { label: "Awaiting reply", value: rows.filter((r) => r.status === "pending").length, icon: Clock },
    { label: "Resolved", value: rows.filter((r) => r.status === "resolved").length, icon: CheckCircle2 },
  ],
  columns: [
    { key: "subject", label: "Subject", render: (r) => <span className="font-medium">{r.subject}</span> },
    { key: "customer_email", label: "From", render: (r) => <span className="text-xs">{r.customer_email || "—"}</span> },
    { key: "customer_name", label: "Name" },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS_PALETTE} /> },
    { key: "assignee_id", label: "Assignee", render: (r, c) => <UserCell userId={r.assignee_id} profiles={c.profiles} /> },
    { key: "created_at", label: "Received", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "subject", label: "Subject", type: "text", required: true },
    { key: "customer_email", label: "From (email)", type: "text", required: true },
    { key: "customer_name", label: "Customer name", type: "text" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "open", label: "Open" }, { value: "pending", label: "Awaiting reply" },
      { value: "resolved", label: "Resolved" }, { value: "closed", label: "Closed" },
    ] },
    { key: "priority", label: "Priority", type: "select", options: [
      { value: "low", label: "Low" }, { value: "normal", label: "Normal" },
      { value: "high", label: "High" }, { value: "urgent", label: "Urgent" },
    ] },
    { key: "assignee_id", label: "Assignee", type: "user" },
    { key: "description", label: "Body", type: "textarea", full: true },
    { key: "tags", label: "Tags", type: "tags", full: true },
  ],
  defaults: { status: "open", priority: "normal" },
};
