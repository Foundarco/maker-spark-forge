import { createFileRoute } from "@tanstack/react-router";
import { FolderOpen, File } from "lucide-react";
import { ResourcePage, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

function fmtBytes(n?: number | null) {
  if (!n) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"]; let i = 0; let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

const cfg: ResourceConfig<any> = {
  table: "hq_files",
  title: "Cloud Storage",
  eyebrow: "Files",
  icon: FolderOpen,
  itemName: "file",
  orderBy: { column: "updated_at", ascending: false },
  searchable: ["name", "folder", "mime_type"],
  defaults: { folder: "/", version: 1 },
  kpis: (rows) => [
    { label: "Files", value: rows.length, icon: File },
    { label: "Total size", value: fmtBytes(rows.reduce((s, r) => s + (r.size_bytes || 0), 0)), icon: FolderOpen },
    { label: "Shared", value: rows.filter((r) => r.is_shared).length, icon: FolderOpen },
    { label: "Folders", value: new Set(rows.map((r) => r.folder).filter(Boolean)).size, icon: FolderOpen },
  ],
  columns: [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "folder", label: "Folder", render: (r) => <span className="text-muted-foreground font-mono text-xs">{r.folder || "/"}</span> },
    { key: "mime_type", label: "Type", render: (r) => <span className="text-muted-foreground text-xs">{r.mime_type || "—"}</span> },
    { key: "size_bytes", label: "Size", render: (r) => <span className="text-muted-foreground text-xs">{fmtBytes(r.size_bytes)}</span> },
    { key: "owner_id", label: "Owner", render: (r, ctx) => <UserCell userId={r.owner_id} profiles={ctx.profiles} /> },
    { key: "updated_at", label: "Modified", render: (r) => <DateCell date={r.updated_at} /> },
  ],
  fields: [
    { key: "name", label: "File name", type: "text", required: true, full: true, placeholder: "quarterly-report.pdf" },
    { key: "folder", label: "Folder path", type: "text", placeholder: "/engineering/specs" },
    { key: "path", label: "Storage path / URL", type: "text", full: true, placeholder: "bucket/key or https://..." },
    { key: "mime_type", label: "MIME type", type: "text", placeholder: "application/pdf" },
    { key: "size_bytes", label: "Size (bytes)", type: "number" },
    { key: "version", label: "Version", type: "number" },
    { key: "owner_id", label: "Owner", type: "user" },
    { key: "is_shared", label: "Shared", type: "bool", placeholder: "Publicly shared" },
    { key: "tags", label: "Tags", type: "tags" },
    { key: "description", label: "Description", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/files")({
  head: () => ({ meta: [{ title: "Cloud Storage — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
