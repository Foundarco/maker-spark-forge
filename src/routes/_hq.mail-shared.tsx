import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "hq_emails",
  title: "Shared Mailboxes",
  eyebrow: "Email",
  icon: Users,
  itemName: "email",
  defaults: { folder: "inbox", mailbox: "support", status: "unread" },
  orderBy: { column: "created_at", ascending: false },
  searchable: ["subject", "from_addr", "mailbox"],
  kpis: (rows) => {
    const boxes = new Set(rows.filter((r) => r.mailbox !== "personal").map((r) => r.mailbox));
    return [
      { label: "Shared boxes", value: boxes.size, icon: Users },
      { label: "Total messages", value: rows.filter((r) => r.mailbox !== "personal").length, icon: Users },
      { label: "Unread", value: rows.filter((r) => r.mailbox !== "personal" && !r.is_read).length, icon: Users },
    ];
  },
  columns: [
    { key: "mailbox", label: "Mailbox", render: (r) => <StatusBadge value={r.mailbox} palette={{ support: "border-amber-500/20 bg-amber-500/10 text-amber-600", sales: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", info: "border-primary/20 bg-primary/10 text-primary" }} /> },
    { key: "folder", label: "Folder", render: (r) => <StatusBadge value={r.folder} /> },
    { key: "from_addr", label: "From" },
    { key: "subject", label: "Subject", render: (r) => <span className={r.is_read ? "text-muted-foreground" : "font-semibold"}>{r.subject}</span> },
    { key: "created_at", label: "Received", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "mailbox", label: "Mailbox", type: "select", options: [{ value: "support", label: "support@" }, { value: "sales", label: "sales@" }, { value: "info", label: "info@" }, { value: "billing", label: "billing@" }], required: true },
    { key: "folder", label: "Folder", type: "select", options: [{ value: "inbox", label: "Inbox" }, { value: "sent", label: "Sent" }, { value: "drafts", label: "Drafts" }], required: true },
    { key: "from_addr", label: "From", type: "text" },
    { key: "to_addr", label: "To", type: "text" },
    { key: "subject", label: "Subject", type: "text", required: true, full: true },
    { key: "body", label: "Body", type: "textarea", full: true },
    { key: "status", label: "Status", type: "select", options: [{ value: "unread", label: "Unread" }, { value: "read", label: "Read" }, { value: "resolved", label: "Resolved" }] },
    { key: "is_read", label: "Read", type: "bool" },
  ],
};

export const Route = createFileRoute("/_hq/mail-shared")({
  head: () => ({ meta: [{ title: "Shared Mailboxes — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
