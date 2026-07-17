import { createFileRoute } from "@tanstack/react-router";
import { Share, GitBranch } from "lucide-react";
import { ResourcePage, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";
import { useState } from "react";

const sharedCfg: ResourceConfig<any> = {
  table: "hq_files",
  title: "Shared Files",
  eyebrow: "Files",
  icon: Share,
  itemName: "shared file",
  baseFilter: { is_shared: true },
  orderBy: { column: "updated_at", ascending: false },
  searchable: ["name", "folder"],
  defaults: { is_shared: true, folder: "/", version: 1 },
  kpis: (rows) => [
    { label: "Shared files", value: rows.length, icon: Share },
    { label: "Owners", value: new Set(rows.map((r) => r.owner_id).filter(Boolean)).size, icon: Share },
  ],
  columns: [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "folder", label: "Folder", render: (r) => <span className="text-muted-foreground font-mono text-xs">{r.folder || "/"}</span> },
    { key: "owner_id", label: "Owner", render: (r, ctx) => <UserCell userId={r.owner_id} profiles={ctx.profiles} /> },
    { key: "updated_at", label: "Shared", render: (r) => <DateCell date={r.updated_at} /> },
  ],
  fields: [
    { key: "name", label: "File name", type: "text", required: true, full: true },
    { key: "folder", label: "Folder path", type: "text" },
    { key: "path", label: "Storage path / URL", type: "text", full: true },
    { key: "owner_id", label: "Owner", type: "user" },
    { key: "is_shared", label: "Shared", type: "bool" },
    { key: "tags", label: "Tags", type: "tags" },
    { key: "description", label: "Description", type: "textarea", full: true },
  ],
};

const versionsCfg: ResourceConfig<any> = {
  table: "hq_files",
  title: "Version History",
  eyebrow: "Files",
  icon: GitBranch,
  itemName: "version",
  orderBy: { column: "updated_at", ascending: false },
  searchable: ["name", "folder"],
  defaults: { folder: "/", version: 1 },
  kpis: (rows) => [
    { label: "Total versions", value: rows.length, icon: GitBranch },
    { label: "Files w/ history", value: new Set(rows.filter((r) => r.parent_id).map((r) => r.parent_id)).size, icon: GitBranch },
  ],
  columns: [
    { key: "name", label: "File", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "version", label: "Version", render: (r) => <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-mono">v{r.version || 1}</span> },
    { key: "folder", label: "Folder", render: (r) => <span className="text-muted-foreground font-mono text-xs">{r.folder || "/"}</span> },
    { key: "owner_id", label: "By", render: (r, ctx) => <UserCell userId={r.owner_id} profiles={ctx.profiles} /> },
    { key: "updated_at", label: "Saved", render: (r) => <DateCell date={r.updated_at} /> },
  ],
  fields: [
    { key: "name", label: "File name", type: "text", required: true },
    { key: "version", label: "Version #", type: "number", required: true },
    { key: "folder", label: "Folder path", type: "text" },
    { key: "path", label: "Storage path", type: "text", full: true },
    { key: "owner_id", label: "Modified by", type: "user" },
    { key: "description", label: "Change notes", type: "textarea", full: true },
  ],
};

function SharedAndVersions() {
  const [tab, setTab] = useState<"shared" | "versions">("shared");
  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <div className="inline-flex rounded-lg border border-border bg-card p-1 text-sm">
          <button onClick={() => setTab("shared")} className={`px-3 py-1.5 rounded-md ${tab === "shared" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Shared</button>
          <button onClick={() => setTab("versions")} className={`px-3 py-1.5 rounded-md ${tab === "versions" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Versions</button>
        </div>
      </div>
      <ResourcePage key={tab} config={tab === "shared" ? sharedCfg : versionsCfg} />
    </div>
  );
}

export const Route = createFileRoute("/_hq/files-shared")({
  head: () => ({ meta: [{ title: "Shared & Versions — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: SharedAndVersions,
});
