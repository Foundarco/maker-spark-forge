import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Eye, EyeOff, Globe } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/kb")({
  head: () => ({ meta: [{ title: "Knowledge Base — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const AUDIENCE_PALETTE = {
  internal: "border-border bg-muted/40 text-muted-foreground",
  public: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
};

const config: ResourceConfig<any> = {
  table: "cs_kb_articles",
  title: "Knowledge Base",
  eyebrow: "Customer Service · KB",
  icon: BookOpen,
  itemName: "article",
  baseFilter: { kind: "kb" },
  searchable: ["title", "category", "body"],
  orderBy: { column: "updated_at", ascending: false },
  kpis: (rows) => [
    { label: "Articles", value: rows.length, icon: BookOpen },
    { label: "Published", value: rows.filter((r) => r.published).length, icon: Eye },
    { label: "Drafts", value: rows.filter((r) => !r.published).length, icon: EyeOff },
    { label: "Public", value: rows.filter((r) => r.audience === "public").length, icon: Globe },
  ],
  columns: [
    { key: "title", label: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "category", label: "Category" },
    { key: "audience", label: "Audience", render: (r) => <StatusBadge value={r.audience} palette={AUDIENCE_PALETTE} /> },
    { key: "published", label: "Status", render: (r) => r.published
      ? <span className="text-emerald-500 text-xs">Published</span>
      : <span className="text-muted-foreground text-xs">Draft</span> },
    { key: "views", label: "Views", render: (r) => <span className="tabular-nums text-xs">{r.views ?? 0}</span> },
    { key: "updated_at", label: "Updated", render: (r) => <DateCell date={r.updated_at} /> },
  ],
  fields: [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "category", label: "Category", type: "text", placeholder: "Setup, Troubleshooting..." },
    { key: "audience", label: "Audience", type: "select", options: [
      { value: "internal", label: "Internal only" }, { value: "public", label: "Public / customers" },
    ] },
    { key: "published", label: "Published", type: "bool", placeholder: "Visible to audience" },
    { key: "body", label: "Body (markdown)", type: "textarea", full: true },
    { key: "tags", label: "Tags", type: "tags", full: true },
  ],
  defaults: { audience: "internal", published: false, views: 0 },
};
