import { createFileRoute } from "@tanstack/react-router";
import { BookText, Star } from "lucide-react";
import { ResourcePage, UserCell, ProjectCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/docs")({
  head: () => ({ meta: [{ title: "Engineering Docs — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const config: ResourceConfig<any> = {
  table: "eng_docs",
  title: "Documentation",
  eyebrow: "Engineering · Docs",
  icon: BookText,
  itemName: "doc",
  searchable: ["title", "category", "content"],
  orderBy: { column: "updated_at", ascending: false },
  kpis: (rows) => [
    { label: "Docs", value: rows.length, icon: BookText },
    { label: "Starred", value: rows.filter((r) => r.starred).length, icon: Star },
    { label: "Categories", value: new Set(rows.map((r) => r.category).filter(Boolean)).size, icon: BookText },
  ],
  columns: [
    { key: "title", label: "Title", render: (r) => <span className="font-medium flex items-center gap-2">{r.starred && <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />}{r.title}</span> },
    { key: "category", label: "Category" },
    { key: "project_id", label: "Project", render: (r, c) => <ProjectCell projectId={r.project_id} projects={c.projects} /> },
    { key: "author_id", label: "Author", render: (r, c) => <UserCell userId={r.author_id} profiles={c.profiles} /> },
    { key: "updated_at", label: "Updated", render: (r) => <DateCell date={r.updated_at} /> },
  ],
  fields: [
    { key: "title", label: "Title", type: "text", required: true, full: true },
    { key: "category", label: "Category", type: "text", placeholder: "Getting started, Reference, ADR..." },
    { key: "project_id", label: "Project", type: "project" },
    { key: "author_id", label: "Author", type: "user" },
    { key: "starred", label: "Starred", type: "bool", placeholder: "Pin to top" },
    { key: "content", label: "Content (Markdown)", type: "textarea", full: true },
  ],
  defaults: { starred: false },
};
