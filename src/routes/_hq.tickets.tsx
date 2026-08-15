import { createFileRoute } from "@tanstack/react-router";
import { Ticket, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/tickets")({
  head: () => ({ meta: [{ title: "Research Requests — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS_PALETTE = {
  open: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  resolved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  closed: "border-border bg-muted/40 text-muted-foreground",
};
const PRIORITY_PALETTE = {
  low: "border-border bg-muted/40 text-muted-foreground",
  normal: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  high: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  urgent: "border-destructive/40 bg-destructive/10 text-destructive",
};

const config: ResourceConfig<any> = {
  table: "cs_tickets",
  title: "Research Requests",
  eyebrow: "Research & Partners · Tickets",
  icon: Ticket,
  itemName: "ticket",
  searchable: ["ticket_number", "subject", "customer_name", "customer_email"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => [
    { label: "Total", value: rows.length, icon: Ticket },
    { label: "Open", value: rows.filter((r) => r.status === "open").length, icon: AlertCircle },
    { label: "Pending", value: rows.filter((r) => r.status === "pending").length, icon: Clock },
    { label: "Resolved", value: rows.filter((r) => r.status === "resolved").length, icon: CheckCircle2 },
  ],
  columns: [
    { key: "ticket_number", label: "#", render: (r) => <span className="font-mono text-xs">{r.ticket_number || r.id.slice(0, 8)}</span> },
    { key: "subject", label: "Subject", render: (r) => <span className="font-medium">{r.subject}</span> },
    { key: "customer_name", label: "Customer", render: (r) => <div className="text-xs"><div>{r.customer_name || "—"}</div>{r.customer_email && <div className="text-muted-foreground">{r.customer_email}</div>}</div> },
    { key: "channel", label: "Channel", render: (r) => <span className="text-xs uppercase tracking-wide text-muted-foreground">{r.channel}</span> },
    { key: "priority", label: "Priority", render: (r) => <StatusBadge value={r.priority} palette={PRIORITY_PALETTE} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS_PALETTE} /> },
    { key: "assignee_id", label: "Assignee", render: (r, c) => <UserCell userId={r.assignee_id} profiles={c.profiles} /> },
    { key: "created_at", label: "Created", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "ticket_number", label: "Ticket #", type: "text", placeholder: "auto-generated if blank" },
    { key: "subject", label: "Subject", type: "text", required: true },
    { key: "channel", label: "Channel", type: "select", options: [
      { value: "web", label: "Web" }, { value: "email", label: "Email" },
      { value: "chat", label: "Live chat" }, { value: "phone", label: "Phone" },
    ] },
    { key: "priority", label: "Priority", type: "select", options: [
      { value: "low", label: "Low" }, { value: "normal", label: "Normal" },
      { value: "high", label: "High" }, { value: "urgent", label: "Urgent" },
    ] },
    { key: "status", label: "Status", type: "select", options: [
      { value: "open", label: "Open" }, { value: "pending", label: "Pending" },
      { value: "resolved", label: "Resolved" }, { value: "closed", label: "Closed" },
    ] },
    { key: "assignee_id", label: "Assignee", type: "user" },
    { key: "customer_name", label: "Customer name", type: "text" },
    { key: "customer_email", label: "Customer email", type: "text" },
    { key: "customer_phone", label: "Customer phone", type: "text" },
    { key: "description", label: "Description", type: "textarea", full: true },
    { key: "tags", label: "Tags", type: "tags", full: true },
  ],
  defaults: { channel: "web", priority: "normal", status: "open" },
};
