import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Search, Loader2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { UserMention } from "./UserMention";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "user"
  | "project"
  | "supplier"
  | "workorder"
  | "tags"
  | "bool";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  full?: boolean;
  placeholder?: string;
};

export type ColumnDef<T = any> = {
  key: string;
  label: string;
  render?: (row: T, ctx: Ctx) => React.ReactNode;
  className?: string;
};

export type KPI = { label: string; value: string | number; icon: LucideIcon; hint?: string };

export type ResourceConfig<T = any> = {
  table: string;
  title: string;
  eyebrow: string;
  icon: LucideIcon;
  itemName: string; // "project", "task", etc
  columns: ColumnDef<T>[];
  fields: FieldDef[];
  orderBy?: { column: string; ascending?: boolean };
  kpis?: (rows: T[]) => KPI[];
  searchable?: string[]; // column keys to include in text search
  defaults?: Record<string, any>;
  baseFilter?: Record<string, any>; // eq filter applied to load + merged into new-row defaults
};

type Profile = { id: string; full_name: string | null; email: string | null };
type Project = { id: string; name: string; code: string | null };
type Supplier = { id: string; name: string };
type WorkOrder = { id: string; order_number: string; product_name: string };
type Ctx = { profiles: Profile[]; projects: Project[]; suppliers: Supplier[]; workorders: WorkOrder[] };

export function ResourcePage<T extends { id: string }>({ config }: { config: ResourceConfig<T> }) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [ctx, setCtx] = useState<Ctx>({ profiles: [], projects: [], suppliers: [], workorders: [] });
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);

  const needs = useMemo(() => {
    const s = new Set(config.fields.map((f) => f.type));
    return {
      profiles: s.has("user"),
      projects: s.has("project"),
      suppliers: s.has("supplier"),
      workorders: s.has("workorder"),
    };
  }, [config.fields]);

  const load = async () => {
    setLoading(true);
    const orderCol = config.orderBy?.column ?? "created_at";
    const ascending = config.orderBy?.ascending ?? false;
    let q = (supabase.from(config.table as any) as any).select("*").order(orderCol, { ascending });
    if (config.baseFilter) {
      for (const [k, v] of Object.entries(config.baseFilter)) q = q.eq(k, v);
    }
    const { data } = await q;
    setRows((data ?? []) as T[]);

    const promises: Array<Promise<{ data: any }>> = [
      needs.profiles ? (supabase.from("profiles").select("id, full_name, email").order("full_name") as any) : Promise.resolve({ data: [] }),
      needs.projects ? ((supabase.from("eng_projects") as any).select("id, name, code").order("name") as any) : Promise.resolve({ data: [] }),
      needs.suppliers ? ((supabase.from("mfg_suppliers") as any).select("id, name").order("name") as any) : Promise.resolve({ data: [] }),
      needs.workorders ? ((supabase.from("mfg_work_orders") as any).select("id, order_number, product_name").order("created_at", { ascending: false }) as any) : Promise.resolve({ data: [] }),
    ];
    const [p, pr, su, wo] = await Promise.all(promises);
    setCtx({
      profiles: (p.data ?? []) as Profile[],
      projects: (pr.data ?? []) as Project[],
      suppliers: (su.data ?? []) as Supplier[],
      workorders: (wo.data ?? []) as WorkOrder[],
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, [config.table]);

  const remove = async (id: string) => {
    if (!confirm(`Delete this ${config.itemName}?`)) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    const { error } = await (supabase.from(config.table as any) as any).delete().eq("id", id);
    if (error) { alert(error.message); load(); }
  };

  const filtered = useMemo(() => {
    if (!q.trim() || !config.searchable?.length) return rows;
    const s = q.toLowerCase();
    return rows.filter((r: any) =>
      config.searchable!.some((k) => String(r[k] ?? "").toLowerCase().includes(s))
    );
  }, [rows, q, config.searchable]);

  const kpis = config.kpis?.(rows) ?? [];
  const Icon = config.icon;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{config.eyebrow}</p>
            <h1 className="text-3xl font-semibold tracking-tight">{config.title}</h1>
          </div>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New {config.itemName}
        </button>
      </div>

      {kpis.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</p>
                <k.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{k.value}</p>
              {k.hint && <p className="mt-1 text-[11px] text-muted-foreground">{k.hint}</p>}
            </div>
          ))}
        </div>
      )}

      {config.searchable?.length ? (
        <div className="mb-4 relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${config.itemName}s...`}
            className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-sm">No {config.itemName}s yet.</p>
            <button onClick={() => setCreating(true)} className="mt-3 text-sm text-primary hover:underline">Create the first one</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  {config.columns.map((c) => (
                    <th key={c.key} className={`px-4 py-3 font-medium ${c.className ?? ""}`}>{c.label}</th>
                  ))}
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                    {config.columns.map((c) => (
                      <td key={c.key} className={`px-4 py-3 ${c.className ?? ""}`}>
                        {c.render ? c.render(r, ctx) : String((r as any)[c.key] ?? "—")}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(r)} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => remove(r.id)} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(creating || editing) && (
        <ResourceDialog
          config={config}
          ctx={ctx}
          row={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function ResourceDialog<T extends { id: string }>({ config, ctx, row, onClose, onSaved }: {
  config: ResourceConfig<T>;
  ctx: Ctx;
  row: T | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Record<string, any>>(() => {
    if (row) return { ...row };
    const base: Record<string, any> = {};
    for (const f of config.fields) {
      if (f.type === "tags") base[f.key] = [];
      else if (f.type === "bool") base[f.key] = false;
      else base[f.key] = "";
    }
    return { ...base, ...(config.defaults ?? {}), ...(config.baseFilter ?? {}) };
  });
  const [saving, setSaving] = useState(false);
  const isEdit = !!row;

  const set = (k: string, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const payload: Record<string, any> = {};
    for (const f of config.fields) {
      let v = form[f.key];
      if (v === "" || v == null) {
        if (f.required) { alert(`${f.label} is required`); setSaving(false); return; }
        v = null;
      } else if (f.type === "number") v = Number(v);
      else if (f.type === "tags") v = Array.isArray(v) ? v : String(v).split(",").map((s) => s.trim()).filter(Boolean);
      payload[f.key] = v;
    }
    if (!isEdit && user) payload.created_by = user.id;
    if (!isEdit && config.baseFilter) Object.assign(payload, config.baseFilter);
    let error: any = null;
    if (isEdit) {
      ({ error } = await (supabase.from(config.table as any) as any).update(payload).eq("id", (row as any).id));
    } else {
      ({ error } = await (supabase.from(config.table as any) as any).insert(payload));
    }
    setSaving(false);
    if (error) { alert(error.message); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit" : "New"} {config.itemName}</h2>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {config.fields.map((f) => (
              <div key={f.key} className={f.full || f.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {f.label}{f.required && <span className="text-destructive"> *</span>}
                </label>
                <FieldInput field={f} value={form[f.key]} onChange={(v) => set(f.key, v)} ctx={ctx} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">Cancel</button>
          <button onClick={submit} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEdit ? "Save changes" : `Create ${config.itemName}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange, ctx }: { field: FieldDef; value: any; onChange: (v: any) => void; ctx: Ctx }) {
  const base = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary";
  if (field.type === "textarea") return <textarea rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={base} />;
  if (field.type === "number") return <input type="number" step="any" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={base} />;
  if (field.type === "date") return <input type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={base} />;
  if (field.type === "bool") return (
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {field.placeholder ?? "Enabled"}</label>
  );
  if (field.type === "tags") {
    const arr: string[] = Array.isArray(value) ? value : [];
    return <input value={arr.join(", ")} onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="tag1, tag2" className={base} />;
  }
  if (field.type === "select") {
    return (
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={base}>
        <option value="">—</option>
        {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }
  if (field.type === "user") {
    return (
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={base}>
        <option value="">Unassigned</option>
        {ctx.profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email || p.id.slice(0, 8)}</option>)}
      </select>
    );
  }
  if (field.type === "project") {
    return (
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={base}>
        <option value="">No project</option>
        {ctx.projects.map((p) => <option key={p.id} value={p.id}>{p.code ? `${p.code} · ${p.name}` : p.name}</option>)}
      </select>
    );
  }
  if (field.type === "supplier") {
    return (
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={base}>
        <option value="">—</option>
        {ctx.suppliers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    );
  }
  if (field.type === "workorder") {
    return (
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={base}>
        <option value="">—</option>
        {ctx.workorders.map((p) => <option key={p.id} value={p.id}>{p.order_number} — {p.product_name}</option>)}
      </select>
    );
  }
  return <input type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={base} />;
}

/* ------- shared render helpers ------- */

export function StatusBadge({ value, palette }: { value: string | null; palette?: Record<string, string> }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  const cls = palette?.[value] ?? "border-border bg-muted/40 text-muted-foreground";
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>{value.replace(/_/g, " ")}</span>;
}

export function UserCell({ userId, profiles }: { userId: string | null; profiles: Profile[] }) {
  if (!userId) return <span className="text-muted-foreground text-xs">Unassigned</span>;
  const p = profiles.find((x) => x.id === userId);
  return <UserMention userId={userId} name={p?.full_name || p?.email || "User"} />;
}

export function ProjectCell({ projectId, projects }: { projectId: string | null; projects: Project[] }) {
  if (!projectId) return <span className="text-muted-foreground text-xs">—</span>;
  const p = projects.find((x) => x.id === projectId);
  return <span className="text-sm">{p?.code ?? p?.name ?? "—"}</span>;
}

export function SupplierCell({ supplierId, suppliers }: { supplierId: string | null; suppliers: Supplier[] }) {
  if (!supplierId) return <span className="text-muted-foreground text-xs">—</span>;
  const s = suppliers.find((x) => x.id === supplierId);
  return <span className="text-sm">{s?.name ?? "—"}</span>;
}

export function DateCell({ date }: { date: string | null }) {
  if (!date) return <span className="text-muted-foreground text-xs">—</span>;
  const d = new Date(date);
  return <span className="text-sm text-muted-foreground">{d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>;
}
