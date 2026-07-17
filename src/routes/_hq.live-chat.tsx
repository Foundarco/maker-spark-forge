import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/live-chat")({
  head: () => ({ meta: [{ title: "Live Chat — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS_PALETTE = {
  open: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  resolved: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  closed: "border-border bg-muted/40 text-muted-foreground",
};

const config: ResourceConfig<any> = {
  table: "cs_tickets",
  title: "Live Chat Sessions",
  eyebrow: "Customer Service · Chat",
  icon: MessageCircle,
  itemName: "chat",
  baseFilter: { channel: "chat" },
  searchable: ["subject", "customer_name", "customer_email"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => [
    { label: "Sessions", value: rows.length, icon: MessageCircle },
    { label: "Active", value: rows.filter((r) => r.status === "open").length, icon: AlertCircle },
    { label: "Waiting", value: rows.filter((r) => r.status === "pending").length, icon: Clock },
    { label: "Closed", value: rows.filter((r) => r.status === "resolved" || r.status === "closed").length, icon: CheckCircle2 },
  ],
  columns: [
    { key: "subject", label: "Topic", render: (r) => <span className="font-medium">{r.subject}</span> },
    { key: "customer_name", label: "Visitor", render: (r) => <div className="text-xs"><div>{r.customer_name || "Anonymous"}</div>{r.customer_email && <div className="text-muted-foreground">{r.customer_email}</div>}</div> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS_PALETTE} /> },
    { key: "assignee_id", label: "Agent", render: (r, c) => <UserCell userId={r.assignee_id} profiles={c.profiles} /> },
    { key: "created_at", label: "Started", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "subject", label: "Topic", type: "text", required: true },
    { key: "customer_name", label: "Visitor name", type: "text" },
    { key: "customer_email", label: "Visitor email", type: "text" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "open", label: "Active" }, { value: "pending", label: "Waiting" },
      { value: "resolved", label: "Resolved" }, { value: "closed", label: "Closed" },
    ] },
    { key: "assignee_id", label: "Agent", type: "user" },
    { key: "description", label: "Transcript / notes", type: "textarea", full: true },
    { key: "tags", label: "Tags", type: "tags", full: true },
  ],
  defaults: { status: "open", priority: "normal" },
};
