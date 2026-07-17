import { createFileRoute } from "@tanstack/react-router";
import { SendHorizontal } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, type ResourceConfig } from "@/components/hq/ResourcePage";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

function SentAndDrafts() {
  const [folder, setFolder] = useState<"sent" | "drafts">("sent");
  const cfg: ResourceConfig<any> = {
    table: "hq_emails",
    title: folder === "sent" ? "Sent Mail" : "Drafts",
    eyebrow: "Email",
    icon: SendHorizontal,
    itemName: "email",
    baseFilter: { folder },
    defaults: { folder, mailbox: "personal", status: folder === "sent" ? "sent" : "draft" },
    orderBy: { column: "created_at", ascending: false },
    searchable: ["subject", "to_addr", "from_addr"],
    kpis: (rows) => [{ label: folder === "sent" ? "Sent" : "Drafts", value: rows.length, icon: SendHorizontal }],
    columns: [
      { key: "to_addr", label: "To", render: (r) => <span className="font-medium">{r.to_addr || "—"}</span> },
      { key: "subject", label: "Subject" },
      { key: "mailbox", label: "Mailbox", render: (r) => <StatusBadge value={r.mailbox} /> },
      { key: "created_at", label: folder === "sent" ? "Sent" : "Updated", render: (r) => <DateCell date={r.created_at} /> },
    ],
    fields: [
      { key: "folder", label: "Folder", type: "select", options: [{ value: "sent", label: "Sent" }, { value: "drafts", label: "Drafts" }], required: true },
      { key: "mailbox", label: "Mailbox", type: "select", options: [{ value: "personal", label: "Personal" }, { value: "support", label: "Support" }, { value: "sales", label: "Sales" }, { value: "info", label: "Info" }], required: true },
      { key: "from_addr", label: "From", type: "text" },
      { key: "to_addr", label: "To", type: "text", required: true },
      { key: "cc", label: "Cc", type: "text" },
      { key: "subject", label: "Subject", type: "text", required: true, full: true },
      { key: "body", label: "Body", type: "textarea", full: true },
    ],
  };
  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <div className="inline-flex rounded-lg border border-border bg-card p-1 text-sm">
          <button onClick={() => setFolder("sent")} className={`px-3 py-1.5 rounded-md ${folder === "sent" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Sent</button>
          <button onClick={() => setFolder("drafts")} className={`px-3 py-1.5 rounded-md ${folder === "drafts" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Drafts</button>
        </div>
      </div>
      <ResourcePage key={folder} config={cfg} />
    </div>
  );
}

export const Route = createFileRoute("/_hq/mail-sent")({
  head: () => ({ meta: [{ title: "Sent & Drafts — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: SentAndDrafts,
});
