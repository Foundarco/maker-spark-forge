import { createFileRoute } from "@tanstack/react-router";
import { Cpu } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, ProjectCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/firmware")({
  head: () => ({ meta: [{ title: "Firmware & Repos — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS = { active: "border-green-500/30 bg-green-500/10 text-green-500", maintenance: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500", archived: "border-muted-foreground/30 bg-muted/40 text-muted-foreground" };

const config: ResourceConfig<any> = {
  table: "eng_firmware_repos",
  title: "Firmware & Repos",
  eyebrow: "Engineering · Firmware",
  icon: Cpu,
  itemName: "repo",
  searchable: ["name", "description", "language"],
  kpis: (rows) => [
    { label: "Repos", value: rows.length, icon: Cpu },
    { label: "Active", value: rows.filter((r) => r.status === "active").length, icon: Cpu },
    { label: "Maintenance", value: rows.filter((r) => r.status === "maintenance").length, icon: Cpu },
    { label: "Archived", value: rows.filter((r) => r.status === "archived").length, icon: Cpu },
  ],
  columns: [
    { key: "name", label: "Repo", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "language", label: "Language" },
    { key: "latest_version", label: "Version", render: (r) => <span className="font-mono text-xs">{r.latest_version || "—"}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
    { key: "project_id", label: "Project", render: (r, c) => <ProjectCell projectId={r.project_id} projects={c.projects} /> },
    { key: "owner_id", label: "Owner", render: (r, c) => <UserCell userId={r.owner_id} profiles={c.profiles} /> },
    { key: "repo_url", label: "URL", render: (r) => r.repo_url ? <a href={r.repo_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">Link</a> : <span className="text-muted-foreground text-xs">—</span> },
  ],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "language", label: "Language", type: "text", placeholder: "C++, Python, Rust..." },
    { key: "latest_version", label: "Latest version", type: "text", placeholder: "v2.5.1" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "active", label: "Active" }, { value: "maintenance", label: "Maintenance" }, { value: "archived", label: "Archived" },
    ] },
    { key: "project_id", label: "Project", type: "project" },
    { key: "owner_id", label: "Owner", type: "user" },
    { key: "repo_url", label: "Repo URL", type: "text", full: true },
    { key: "description", label: "Description", type: "textarea", full: true },
  ],
  defaults: { status: "active" },
};
