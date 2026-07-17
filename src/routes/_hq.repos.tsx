import { createFileRoute } from "@tanstack/react-router";
import { GitBranch, GitFork, GitCommit, Code2 } from "lucide-react";
import { ResourcePage, StatusBadge, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "dev_repos",
  title: "Code & Repos",
  eyebrow: "Development",
  icon: GitBranch,
  itemName: "repository",
  orderBy: { column: "name", ascending: true },
  searchable: ["name", "provider", "language", "description"],
  defaults: { visibility: "private", status: "active", provider: "github" },
  kpis: (rows) => [
    { label: "Repositories", value: rows.length, icon: GitBranch },
    { label: "Active", value: rows.filter((r) => r.status === "active").length, icon: GitCommit },
    { label: "Public", value: rows.filter((r) => r.visibility === "public").length, icon: GitFork },
    { label: "Languages", value: new Set(rows.map((r) => r.language).filter(Boolean)).size, icon: Code2 },
  ],
  columns: [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "provider", label: "Provider", render: (r) => <StatusBadge value={r.provider} /> },
    { key: "language", label: "Language", render: (r) => <StatusBadge value={r.language} /> },
    { key: "default_branch", label: "Branch" },
    { key: "visibility", label: "Visibility", render: (r) => <StatusBadge value={r.visibility} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={{ active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", archived: "border-muted/30 bg-muted/10 text-muted-foreground" }} /> },
  ],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "provider", label: "Provider", type: "select", options: ["github","gitlab","bitbucket","self-hosted"].map((v) => ({ value: v, label: v })) },
    { key: "url", label: "URL", type: "text", full: true },
    { key: "default_branch", label: "Default branch", type: "text" },
    { key: "language", label: "Primary language", type: "text" },
    { key: "visibility", label: "Visibility", type: "select", options: [{ value: "private", label: "Private" }, { value: "internal", label: "Internal" }, { value: "public", label: "Public" }] },
    { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "archived", label: "Archived" }] },
    { key: "owner_id", label: "Owner", type: "user" },
    { key: "description", label: "Description", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/repos")({
  head: () => ({ meta: [{ title: "Code & Repos — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
