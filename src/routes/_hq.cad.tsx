import { createFileRoute } from "@tanstack/react-router";
import { FileBox } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, ProjectCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/cad")({
  head: () => ({ meta: [{ title: "Design Library — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS = { draft: "border-muted-foreground/30 bg-muted/40 text-muted-foreground", in_review: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500", released: "border-green-500/30 bg-green-500/10 text-green-500", obsolete: "border-destructive/30 bg-destructive/10 text-destructive" };

const config: ResourceConfig<any> = {
  table: "eng_cad_parts",
  title: "Design Library",
  eyebrow: "Engineering · CAD",
  icon: FileBox,
  itemName: "part",
  searchable: ["part_number", "name", "assembly", "description"],
  orderBy: { column: "part_number", ascending: true },
  kpis: (rows) => [
    { label: "Parts", value: rows.length, icon: FileBox },
    { label: "Released", value: rows.filter((r) => r.status === "released").length, icon: FileBox },
    { label: "In review", value: rows.filter((r) => r.status === "in_review").length, icon: FileBox },
    { label: "Draft", value: rows.filter((r) => r.status === "draft").length, icon: FileBox },
  ],
  columns: [
    { key: "part_number", label: "Part #", render: (r) => <span className="font-mono text-xs">{r.part_number}</span> },
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "revision", label: "Rev", render: (r) => <span className="font-mono text-xs">{r.revision}</span> },
    { key: "assembly", label: "Assembly" },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
    { key: "project_id", label: "Project", render: (r, c) => <ProjectCell projectId={r.project_id} projects={c.projects} /> },
    { key: "owner_id", label: "Owner", render: (r, c) => <UserCell userId={r.owner_id} profiles={c.profiles} /> },
  ],
  fields: [
    { key: "part_number", label: "Part number", type: "text", required: true },
    { key: "name", label: "Name", type: "text", required: true },
    { key: "revision", label: "Revision", type: "text" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "draft", label: "Draft" }, { value: "in_review", label: "In review" },
      { value: "released", label: "Released" }, { value: "obsolete", label: "Obsolete" },
    ] },
    { key: "assembly", label: "Assembly", type: "text" },
    { key: "project_id", label: "Project", type: "project" },
    { key: "owner_id", label: "Owner", type: "user" },
    { key: "file_url", label: "File URL", type: "text", full: true },
    { key: "description", label: "Description", type: "textarea", full: true },
  ],
  defaults: { status: "draft", revision: "A" },
};
