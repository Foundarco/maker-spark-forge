import { createFileRoute } from "@tanstack/react-router";
import { Users2, Building2, UserPlus, Mail } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/crm")({
  head: () => ({ meta: [{ title: "CRM & Contacts — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const KIND_PALETTE = {
  lead: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  contact: "border-border bg-muted/40 text-muted-foreground",
  account: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
};

const config: ResourceConfig<any> = {
  table: "sales_contacts",
  title: "CRM & Contacts",
  eyebrow: "Sales · CRM",
  icon: Users2,
  itemName: "contact",
  searchable: ["name", "email", "company", "phone", "title"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => [
    { label: "Total", value: rows.length, icon: Users2 },
    { label: "Leads", value: rows.filter((r) => r.kind === "lead").length, icon: UserPlus },
    { label: "Accounts", value: rows.filter((r) => r.kind === "account").length, icon: Building2 },
    { label: "Companies", value: new Set(rows.map((r) => r.company).filter(Boolean)).size, icon: Building2 },
  ],
  columns: [
    { key: "name", label: "Name", render: (r) => <div><div className="font-medium">{r.name}</div>{r.title && <div className="text-xs text-muted-foreground">{r.title}</div>}</div> },
    { key: "kind", label: "Type", render: (r) => <StatusBadge value={r.kind} palette={KIND_PALETTE} /> },
    { key: "company", label: "Company" },
    { key: "email", label: "Email", render: (r) => r.email ? <a href={`mailto:${r.email}`} className="text-primary hover:underline text-xs inline-flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</a> : "—" },
    { key: "phone", label: "Phone", render: (r) => r.phone ? <span className="text-xs">{r.phone}</span> : "—" },
    { key: "source", label: "Source" },
    { key: "owner_id", label: "Owner", render: (r, c) => <UserCell userId={r.owner_id} profiles={c.profiles} /> },
  ],
  fields: [
    { key: "kind", label: "Type", type: "select", options: [
      { value: "lead", label: "Lead" }, { value: "contact", label: "Contact" }, { value: "account", label: "Customer account" },
    ] },
    { key: "name", label: "Name / Company name", type: "text", required: true },
    { key: "email", label: "Email", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "company", label: "Company", type: "text" },
    { key: "title", label: "Title / role", type: "text" },
    { key: "source", label: "Source", type: "text", placeholder: "Referral, event, website..." },
    { key: "status", label: "Status", type: "select", options: [
      { value: "active", label: "Active" }, { value: "cold", label: "Cold" }, { value: "archived", label: "Archived" },
    ] },
    { key: "owner_id", label: "Owner", type: "user" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
    { key: "tags", label: "Tags", type: "tags", full: true },
  ],
  defaults: { kind: "contact", status: "active" },
};
