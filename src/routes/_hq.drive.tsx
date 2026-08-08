import { createFileRoute } from "@tanstack/react-router";
import { EscapeKey } from "@/components/hq/EscapeKey";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  HardDrive, FolderPlus, Upload, Search, Star, Trash2, ChevronRight,
  Folder, FileText, FileImage, FileVideo, FileArchive, File as FileIcon,
  MoreHorizontal, Download, Share2, Edit2, Loader2, ArrowLeft, Grid3x3, List, StarOff,
} from "lucide-react";

export const Route = createFileRoute("/_hq/drive")({
  head: () => ({ meta: [{ title: "Drive — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: DrivePage,
});

type Item = {
  id: string;
  owner_id: string;
  parent_id: string | null;
  kind: "folder" | "file";
  name: string;
  mime_type: string | null;
  size_bytes: number | null;
  storage_path: string | null;
  starred: boolean;
  trashed_at: string | null;
  description: string | null;
  updated_at: string;
};

type View = "my" | "starred" | "trash" | "shared";

function fmtBytes(n?: number | null) {
  if (!n) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"]; let i = 0; let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

function iconFor(item: Item) {
  if (item.kind === "folder") return Folder;
  const m = item.mime_type || "";
  if (m.startsWith("image/")) return FileImage;
  if (m.startsWith("video/")) return FileVideo;
  if (m.includes("zip") || m.includes("archive")) return FileArchive;
  if (m.includes("text") || m.includes("pdf") || m.includes("document")) return FileText;
  return FileIcon;
}

function DrivePage() {
  const [me, setMe] = useState<string | null>(null);
  const [view, setView] = useState<View>("my");
  const [layout, setLayout] = useState<"grid" | "list">("list");
  const [parentId, setParentId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Item[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState<{ name: string; pct: number }[]>([]);
  const [renaming, setRenaming] = useState<Item | null>(null);
  const [shareTarget, setShareTarget] = useState<Item | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null)); }, []);

  const load = async () => {
    if (!me) return;
    setLoading(true);
    let q = supabase.from("drive_items").select("*").order("kind", { ascending: false }).order("name");
    if (view === "trash") {
      q = q.not("trashed_at", "is", null);
    } else {
      q = q.is("trashed_at", null);
      if (view === "starred") q = q.eq("starred", true);
      else if (view === "my") q = q.eq("owner_id", me).is("parent_id", parentId as any);
      else if (view === "shared") q = q.neq("owner_id", me);
    }
    const { data } = await q;
    setItems((data ?? []) as Item[]);
    setLoading(false);
  };

  useEffect(() => { if (me) void load(); /* eslint-disable-next-line */ }, [me, view, parentId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(s));
  }, [items, search]);

  const openFolder = async (folder: Item) => {
    setParentId(folder.id);
    setBreadcrumbs((prev) => [...prev, folder]);
    setSelected(new Set());
  };

  const goUp = () => {
    const next = breadcrumbs.slice(0, -1);
    setBreadcrumbs(next);
    setParentId(next.length ? next[next.length - 1].id : null);
    setSelected(new Set());
  };

  const goToCrumb = (idx: number) => {
    if (idx < 0) { setBreadcrumbs([]); setParentId(null); }
    else { const next = breadcrumbs.slice(0, idx + 1); setBreadcrumbs(next); setParentId(next[idx].id); }
    setSelected(new Set());
  };

  const createFolder = async () => {
    if (!me) return;
    const name = prompt("Folder name?")?.trim();
    if (!name) return;
    const { error } = await supabase.from("drive_items").insert({ owner_id: me, parent_id: parentId, kind: "folder", name } as any);
    if (error) alert(error.message);
    else void load();
  };

  const uploadFiles = async (files: FileList) => {
    if (!me || !files.length) return;
    for (const file of Array.from(files)) {
      if (file.size > 100 * 1024 * 1024) { alert(`${file.name} exceeds 100MB`); continue; }
      const id = crypto.randomUUID();
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
      const path = `${me}/${id}${ext ? "." + ext : ""}`;
      setUploading((u) => [...u, { name: file.name, pct: 0 }]);
      const { error: upErr } = await supabase.storage.from("drive").upload(path, file, { contentType: file.type });
      if (upErr) { alert(upErr.message); setUploading((u) => u.filter((x) => x.name !== file.name)); continue; }
      const { error } = await supabase.from("drive_items").insert({
        owner_id: me, parent_id: parentId, kind: "file", name: file.name,
        mime_type: file.type, size_bytes: file.size, storage_path: path,
      } as any);
      if (error) alert(error.message);
      setUploading((u) => u.filter((x) => x.name !== file.name));
    }
    void load();
  };

  const toggleStar = async (item: Item) => {
    await supabase.from("drive_items").update({ starred: !item.starred } as any).eq("id", item.id);
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, starred: !i.starred } : i));
  };

  const trashItem = async (item: Item) => {
    await supabase.from("drive_items").update({ trashed_at: new Date().toISOString() } as any).eq("id", item.id);
    void load();
  };

  const restoreItem = async (item: Item) => {
    await supabase.from("drive_items").update({ trashed_at: null } as any).eq("id", item.id);
    void load();
  };

  const deleteForever = async (item: Item) => {
    if (!confirm(`Delete "${item.name}" forever?`)) return;
    if (item.storage_path) await supabase.storage.from("drive").remove([item.storage_path]);
    await supabase.from("drive_items").delete().eq("id", item.id);
    void load();
  };

  const doRename = async (name: string) => {
    if (!renaming || !name.trim()) { setRenaming(null); return; }
    await supabase.from("drive_items").update({ name: name.trim() } as any).eq("id", renaming.id);
    setRenaming(null);
    void load();
  };

  const openFile = async (item: Item) => {
    if (!item.storage_path) return;
    const { data } = await supabase.storage.from("drive").createSignedUrl(item.storage_path, 60 * 5);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const downloadFile = async (item: Item) => {
    if (!item.storage_path) return;
    const { data } = await supabase.storage.from("drive").createSignedUrl(item.storage_path, 60 * 5, { download: item.name });
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col gap-1 border-r border-border bg-muted/20 p-3">
        <div className="mb-3 flex items-center gap-2 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HardDrive className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Core</p>
            <p className="text-sm font-semibold">Drive</p>
          </div>
        </div>

        <div className="mb-2 flex flex-col gap-1">
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm">
            <Upload className="h-4 w-4" /> Upload
          </button>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) void uploadFiles(e.target.files); e.target.value = ""; }} />
          <button onClick={createFolder} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted">
            <FolderPlus className="h-4 w-4" /> New folder
          </button>
        </div>

        {(["my", "starred", "shared", "trash"] as View[]).map((v) => {
          const label = v === "my" ? "My Drive" : v === "starred" ? "Starred" : v === "shared" ? "Shared with me" : "Trash";
          const Icon = v === "my" ? HardDrive : v === "starred" ? Star : v === "shared" ? Share2 : Trash2;
          return (
            <button
              key={v}
              onClick={() => { setView(v); setParentId(null); setBreadcrumbs([]); setSelected(new Set()); }}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm ${view === v ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          );
        })}

        {uploading.length > 0 && (
          <div className="mt-4 space-y-1 rounded-lg border border-border bg-background p-2 text-xs">
            <p className="font-semibold text-muted-foreground">Uploading</p>
            {uploading.map((u, i) => (
              <div key={i} className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span className="truncate">{u.name}</span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex items-center gap-1 text-sm">
            {view === "my" && (
              <>
                {breadcrumbs.length > 0 && (
                  <button onClick={goUp} className="mr-1 rounded p-1 hover:bg-muted" aria-label="Up">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => goToCrumb(-1)} className={`rounded px-2 py-1 hover:bg-muted ${breadcrumbs.length === 0 ? "font-semibold" : "text-muted-foreground"}`}>
                  My Drive
                </button>
                {breadcrumbs.map((b, i) => (
                  <span key={b.id} className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <button onClick={() => goToCrumb(i)} className={`rounded px-2 py-1 hover:bg-muted ${i === breadcrumbs.length - 1 ? "font-semibold" : "text-muted-foreground"}`}>
                      {b.name}
                    </button>
                  </span>
                ))}
              </>
            )}
            {view !== "my" && <span className="font-semibold">{view === "starred" ? "Starred" : view === "shared" ? "Shared with me" : "Trash"}</span>}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search in Drive" className="w-64 rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-sm outline-none focus:border-primary" />
            </div>
            <div className="flex overflow-hidden rounded-lg border border-border">
              <button onClick={() => setLayout("list")} className={`px-2 py-1.5 ${layout === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`} aria-label="List view"><List className="h-4 w-4" /></button>
              <button onClick={() => setLayout("grid")} className={`px-2 py-1.5 ${layout === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`} aria-label="Grid view"><Grid3x3 className="h-4 w-4" /></button>
            </div>
          </div>
        </header>

        <div
          className="flex-1 overflow-y-auto p-6"
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) void uploadFiles(e.dataTransfer.files); }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <HardDrive className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">This folder is empty</p>
              <p className="mt-1 text-xs text-muted-foreground">Drop files anywhere or click Upload to get started.</p>
            </div>
          ) : layout === "list" ? (
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="w-10 px-3 py-2"></th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Modified</th>
                    <th className="px-3 py-2 text-right">Size</th>
                    <th className="w-32 px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((it) => {
                    const Icon = iconFor(it);
                    return (
                      <tr key={it.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2">
                          <button onClick={() => toggleStar(it)} className="text-muted-foreground hover:text-amber-500" aria-label="Star">
                            {it.starred ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : <StarOff className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onDoubleClick={() => it.kind === "folder" ? openFolder(it) : openFile(it)}
                            onClick={(e) => e.detail === 1 ? undefined : undefined}
                            className="flex items-center gap-2 text-left hover:underline"
                          >
                            <Icon className={`h-4 w-4 ${it.kind === "folder" ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="font-medium">{it.name}</span>
                          </button>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(it.updated_at).toLocaleDateString()}</td>
                        <td className="px-3 py-2 text-right text-xs text-muted-foreground">{it.kind === "folder" ? "—" : fmtBytes(it.size_bytes)}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-1">
                            {view === "trash" ? (
                              <>
                                <button aria-label="Rename" onClick={() => restoreItem(it)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" title="Restore"><Edit2 className="h-3.5 w-3.5" /></button>
                                <button aria-label="Delete" onClick={() => deleteForever(it)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Delete forever"><Trash2 className="h-3.5 w-3.5" /></button>
                              </>
                            ) : (
                              <>
                                {it.kind === "file" && <button aria-label="Download" onClick={() => downloadFile(it)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" title="Download"><Download className="h-3.5 w-3.5" /></button>}
                                <button aria-label="Share" onClick={() => setShareTarget(it)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" title="Share"><Share2 className="h-3.5 w-3.5" /></button>
                                <button aria-label="Rename" onClick={() => setRenaming(it)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" title="Rename"><Edit2 className="h-3.5 w-3.5" /></button>
                                <button aria-label="Delete" onClick={() => trashItem(it)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive" title="Move to trash"><Trash2 className="h-3.5 w-3.5" /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((it) => {
                const Icon = iconFor(it);
                return (
                  <button
                    key={it.id}
                    onDoubleClick={() => it.kind === "folder" ? openFolder(it) : openFile(it)}
                    className="group flex flex-col rounded-xl border border-border bg-background p-3 text-left transition hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`h-8 w-8 ${it.kind === "folder" ? "text-primary" : "text-muted-foreground"}`} />
                      <button onClick={(e) => { e.stopPropagation(); void toggleStar(it); }} className="opacity-0 transition group-hover:opacity-100">
                        {it.starred ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : <StarOff className="h-4 w-4 text-muted-foreground" />}
                      </button>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm font-medium">{it.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{it.kind === "folder" ? "Folder" : fmtBytes(it.size_bytes)}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Rename modal */}
      {renaming && (
        <RenameDialog item={renaming} onClose={() => setRenaming(null)} onSave={doRename} />
      )}

      {/* Share dialog */}
      {shareTarget && me && (
        <ShareDialog item={shareTarget} me={me} onClose={() => setShareTarget(null)} />
      )}
    </div>
  );
}

function RenameDialog({ item, onClose, onSave }: { item: Item; onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState(item.name);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Dialog">
      <EscapeKey onEscape={onClose} />
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-2xl">
        <h3 className="text-lg font-semibold">Rename</h3>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">Cancel</button>
          <button onClick={() => onSave(name)} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">Save</button>
        </div>
      </div>
    </div>
  );
}

function ShareDialog({ item, me, onClose }: { item: Item; me: string; onClose: () => void }) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [shares, setShares] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [perm, setPerm] = useState<"view" | "comment" | "edit">("view");

  const loadShares = async () => {
    const { data } = await supabase.from("drive_shares").select("*").eq("item_id", item.id);
    setShares(data ?? []);
  };
  useEffect(() => { void loadShares(); }, [item.id]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let req = supabase.from("profiles").select("id, full_name, email").neq("id", me).limit(6);
      if (query.trim()) req = req.ilike("full_name", `%${query}%`);
      const { data } = await req;
      if (!cancelled) setProfiles(data ?? []);
    })();
    return () => { cancelled = true; };
  }, [query, me]);

  const add = async (uid: string) => {
    await supabase.from("drive_shares").insert({ item_id: item.id, user_id: uid, permission: perm } as any);
    void loadShares();
  };
  const remove = async (id: string) => {
    await supabase.from("drive_shares").delete().eq("id", id);
    void loadShares();
  };

  const sharedProfiles = shares.map((s) => profiles.find((p) => p.id === s.user_id)).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Dialog">
      <EscapeKey onEscape={onClose} />
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-xl border border-border bg-background p-5 shadow-2xl">
        <h3 className="text-lg font-semibold">Share "{item.name}"</h3>
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people…" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <select value={perm} onChange={(e) => setPerm(e.target.value as any)} className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
              <option value="view">Can view</option>
              <option value="comment">Can comment</option>
              <option value="edit">Can edit</option>
            </select>
          </div>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
            {profiles.map((p) => (
              <button key={p.id} onClick={() => add(p.id)} className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-sm last:border-0 hover:bg-muted">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">{(p.full_name || p.email).charAt(0).toUpperCase()}</span>
                <span className="flex-1">{p.full_name || p.email}</span>
                <span className="text-xs text-primary">Add</span>
              </button>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">People with access</p>
            <div className="mt-2 space-y-1">
              {shares.length === 0 && <p className="text-xs text-muted-foreground">Only you</p>}
              {shares.map((s) => {
                const p = sharedProfiles.find((x: any) => x?.id === s.user_id);
                return (
                  <div key={s.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
                    <span className="flex-1">{p?.full_name || p?.email || s.user_id}</span>
                    <span className="text-xs text-muted-foreground">{s.permission}</span>
                    <button aria-label="Delete" onClick={() => remove(s.id)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button onClick={onClose} className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">Done</button>
        </div>
      </div>
    </div>
  );
}
