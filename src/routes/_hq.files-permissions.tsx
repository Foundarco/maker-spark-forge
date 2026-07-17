import { createFileRoute } from "@tanstack/react-router";
import { Lock, HardDrive } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const permsCfg: ResourceConfig<any> = {
  table: "hq_file_permissions",
  title: "File Permissions",
  eyebrow: "Files",
  icon: Lock,
  itemName: "permission",
  orderBy: { column: "created_at", ascending: false },
  searchable: ["access_level", "notes"],
  kpis: (rows) => [
    { label: "Grants", value: rows.length, icon: Lock },
    { label: "Owners", value: rows.filter((r) => r.access_level === "owner").length, icon: Lock },
    { label: "Editors", value: rows.filter((r) => r.access_level === "edit").length, icon: Lock },
    { label: "Viewers", value: rows.filter((r) => r.access_level === "view").length, icon: Lock },
  ],
  columns: [
    { key: "file_id", label: "File", render: (r) => <FileRef id={r.file_id} /> },
    { key: "user_id", label: "User", render: (r, ctx) => <UserCell userId={r.user_id} profiles={ctx.profiles} /> },
    { key: "access_level", label: "Access", render: (r) => <StatusBadge value={r.access_level} palette={{ owner: "border-primary/20 bg-primary/10 text-primary", edit: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", view: "border-border bg-muted/40 text-muted-foreground" }} /> },
    { key: "notes", label: "Notes" },
    { key: "created_at", label: "Granted", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "file_id", label: "File", type: "select", required: true, options: [], full: true },
    { key: "user_id", label: "User", type: "user", required: true },
    { key: "access_level", label: "Access level", type: "select", required: true, options: [{ value: "view", label: "View" }, { value: "edit", label: "Edit" }, { value: "owner", label: "Owner" }] },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
};

function FileRef({ id }: { id: string | null }) {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => { let live = true; if (!id) return; (supabase.from("hq_files") as any).select("name").eq("id", id).maybeSingle().then(({ data }: any) => { if (live) setName(data?.name ?? null); }); return () => { live = false; }; }, [id]);
  if (!id) return <span className="text-muted-foreground text-xs">—</span>;
  return <span className="text-sm font-mono">{name ?? id.slice(0, 8)}</span>;
}

const backupCfg: ResourceConfig<any> = {
  table: "hq_files",
  title: "Backups",
  eyebrow: "Files",
  icon: HardDrive,
  itemName: "backup",
  baseFilter: { folder: "/backups" },
  defaults: { folder: "/backups", version: 1 },
  orderBy: { column: "created_at", ascending: false },
  searchable: ["name", "description"],
  kpis: (rows) => [
    { label: "Backups", value: rows.length, icon: HardDrive },
    { label: "Latest", value: rows[0]?.name?.slice(0, 20) || "—", icon: HardDrive },
  ],
  columns: [
    { key: "name", label: "Backup", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "description", label: "Notes" },
    { key: "size_bytes", label: "Size", render: (r) => <span className="text-muted-foreground text-xs">{r.size_bytes ? `${(r.size_bytes / 1e9).toFixed(2)} GB` : "—"}</span> },
    { key: "created_at", label: "Created", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "name", label: "Backup name", type: "text", required: true, full: true },
    { key: "path", label: "Storage path", type: "text", full: true },
    { key: "size_bytes", label: "Size (bytes)", type: "number" },
    { key: "description", label: "Notes", type: "textarea", full: true },
  ],
};

function PermsAndBackups() {
  const [tab, setTab] = useState<"perms" | "backups">("perms");
  const [fileOpts, setFileOpts] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    (supabase.from("hq_files") as any).select("id, name").order("name").then(({ data }: any) => {
      setFileOpts((data ?? []).map((f: any) => ({ value: f.id, label: f.name })));
    });
  }, []);
  const cfg = tab === "perms"
    ? { ...permsCfg, fields: permsCfg.fields.map((f) => f.key === "file_id" ? { ...f, options: fileOpts } : f) }
    : backupCfg;
  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <div className="inline-flex rounded-lg border border-border bg-card p-1 text-sm">
          <button onClick={() => setTab("perms")} className={`px-3 py-1.5 rounded-md ${tab === "perms" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Permissions</button>
          <button onClick={() => setTab("backups")} className={`px-3 py-1.5 rounded-md ${tab === "backups" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Backups</button>
        </div>
      </div>
      <ResourcePage key={tab} config={cfg} />
    </div>
  );
}

export const Route = createFileRoute("/_hq/files-permissions")({
  head: () => ({ meta: [{ title: "Permissions & Backup — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: PermsAndBackups,
});
