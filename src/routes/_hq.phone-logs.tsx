import { createFileRoute } from "@tanstack/react-router";
import { Phone, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { ResourcePage, UserCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/phone-logs")({
  head: () => ({ meta: [{ title: "Phone Logs — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const config: ResourceConfig<any> = {
  table: "cs_tickets",
  title: "Phone Logs",
  eyebrow: "Customer Service · Phone",
  icon: Phone,
  itemName: "call",
  baseFilter: { channel: "phone" },
  searchable: ["subject", "customer_name", "customer_phone", "customer_email"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => [
    { label: "Total calls", value: rows.length, icon: Phone },
    { label: "Inbound", value: rows.filter((r) => (r.tags ?? []).includes("inbound")).length, icon: PhoneIncoming },
    { label: "Outbound", value: rows.filter((r) => (r.tags ?? []).includes("outbound")).length, icon: PhoneOutgoing },
    { label: "Follow-up", value: rows.filter((r) => r.status === "pending").length, icon: Phone },
  ],
  columns: [
    { key: "subject", label: "Reason", render: (r) => <span className="font-medium">{r.subject}</span> },
    { key: "customer_name", label: "Caller", render: (r) => <div className="text-xs"><div>{r.customer_name || "—"}</div>{r.customer_phone && <div className="text-muted-foreground">{r.customer_phone}</div>}</div> },
    { key: "assignee_id", label: "Handled by", render: (r, c) => <UserCell userId={r.assignee_id} profiles={c.profiles} /> },
    { key: "status", label: "Follow-up?", render: (r) => r.status === "pending" ? <span className="text-amber-500 text-xs">Yes</span> : <span className="text-muted-foreground text-xs">No</span> },
    { key: "created_at", label: "Time", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "subject", label: "Reason", type: "text", required: true },
    { key: "customer_name", label: "Caller name", type: "text" },
    { key: "customer_phone", label: "Phone", type: "text" },
    { key: "customer_email", label: "Email", type: "text" },
    { key: "assignee_id", label: "Handled by", type: "user" },
    { key: "status", label: "Follow-up needed?", type: "select", options: [
      { value: "resolved", label: "No — resolved" }, { value: "pending", label: "Yes — follow up" },
    ] },
    { key: "description", label: "Call notes", type: "textarea", full: true },
    { key: "tags", label: "Tags (inbound, outbound, voicemail...)", type: "tags", full: true },
  ],
  defaults: { status: "resolved", priority: "normal" },
};
