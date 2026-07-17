import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle, Eye, EyeOff } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/support-faqs")({
  head: () => ({ meta: [{ title: "Support FAQs — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const AUDIENCE_PALETTE = {
  internal: "border-border bg-muted/40 text-muted-foreground",
  public: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
};

const config: ResourceConfig<any> = {
  table: "cs_kb_articles",
  title: "Support FAQs",
  eyebrow: "Customer Service · FAQs",
  icon: HelpCircle,
  itemName: "FAQ",
  baseFilter: { kind: "faq" },
  searchable: ["title", "category", "body"],
  orderBy: { column: "updated_at", ascending: false },
  kpis: (rows) => [
    { label: "FAQs", value: rows.length, icon: HelpCircle },
    { label: "Published", value: rows.filter((r) => r.published).length, icon: Eye },
    { label: "Drafts", value: rows.filter((r) => !r.published).length, icon: EyeOff },
    { label: "Categories", value: new Set(rows.map((r) => r.category).filter(Boolean)).size, icon: HelpCircle },
  ],
  columns: [
    { key: "title", label: "Question", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "category", label: "Category" },
    { key: "audience", label: "Audience", render: (r) => <StatusBadge value={r.audience} palette={AUDIENCE_PALETTE} /> },
    { key: "published", label: "Status", render: (r) => r.published
      ? <span className="text-emerald-500 text-xs">Live</span>
      : <span className="text-muted-foreground text-xs">Draft</span> },
    { key: "updated_at", label: "Updated", render: (r) => <DateCell date={r.updated_at} /> },
  ],
  fields: [
    { key: "title", label: "Question", type: "text", required: true },
    { key: "category", label: "Category", type: "text" },
    { key: "audience", label: "Audience", type: "select", options: [
      { value: "public", label: "Public" }, { value: "internal", label: "Internal" },
    ] },
    { key: "published", label: "Published", type: "bool" },
    { key: "body", label: "Answer", type: "textarea", full: true, required: true },
    { key: "tags", label: "Tags", type: "tags", full: true },
  ],
  defaults: { audience: "public", published: true, views: 0 },
};
