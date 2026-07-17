import { createFileRoute } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "hq_emails",
  title: "Inbox",
  eyebrow: "Email",
  icon: Inbox,
  itemName: "email",
  baseFilter: { folder: "inbox" },
  defaults: { folder: "inbox", mailbox: "personal", status: "unread" },
  orderBy: { column: "created_at", ascending: false },
  searchable: ["subject", "from_addr", "to_addr"],
  kpis: (rows) => [
    { label: "Total", value: rows.length, icon: Inbox },
    { label: "Unread", value: rows.filter((r) => !r.is_read).length, icon: Inbox },
  ],
  columns: [
    { key: "from_addr", label: "From", render: (r) => <span className="font-medium">{r.from_addr || "—"}</span> },
    { key: "subject", label: "Subject", render: (r) => <span className={r.is_read ? "text-muted-foreground" : "font-semibold"}>{r.subject}</span> },
    { key: "mailbox", label: "Mailbox", render: (r) => <StatusBadge value={r.mailbox} palette={{ personal: "border-primary/20 bg-primary/10 text-primary", support: "border-amber-500/20 bg-amber-500/10 text-amber-600", sales: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" }} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
    { key: "created_at", label: "Received", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "folder", label: "Folder", type: "select", options: [{ value: "inbox", label: "Inbox" }, { value: "sent", label: "Sent" }, { value: "drafts", label: "Drafts" }], required: true },
    { key: "mailbox", label: "Mailbox", type: "select", options: [{ value: "personal", label: "Personal" }, { value: "support", label: "Support" }, { value: "sales", label: "Sales" }, { value: "info", label: "Info" }], required: true },
    { key: "from_addr", label: "From", type: "text", placeholder: "sender@example.com" },
    { key: "to_addr", label: "To", type: "text", placeholder: "recipient@example.com" },
    { key: "cc", label: "Cc", type: "text" },
    { key: "bcc", label: "Bcc", type: "text" },
    { key: "subject", label: "Subject", type: "text", required: true, full: true },
    { key: "body", label: "Body", type: "textarea", full: true },
    { key: "status", label: "Status", type: "select", options: [{ value: "unread", label: "Unread" }, { value: "read", label: "Read" }, { value: "archived", label: "Archived" }, { value: "flagged", label: "Flagged" }] },
    { key: "is_read", label: "Mark read", type: "bool", placeholder: "Read" },
  ],
};

export const Route = createFileRoute("/_hq/mail")({
  head: () => ({ meta: [{ title: "Inbox — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
