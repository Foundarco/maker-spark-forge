import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarRange, ChevronLeft, ChevronRight, Loader2, Plus, Search, Users, Truck, X, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Row = Record<string, any>;
type Mode = "crew" | "equipment";

const STATUS_STYLE: Record<string, string> = {
  scheduled: "bg-muted text-muted-foreground",
  ready: "bg-blue-500/15 text-blue-700",
  in_progress: "bg-emerald-500/15 text-emerald-700",
  paused: "bg-amber-500/20 text-amber-700",
  blocked: "bg-destructive/15 text-destructive",
  done: "bg-muted text-muted-foreground line-through",
};

const STATUSES = ["scheduled", "ready", "in_progress", "paused", "blocked", "done"];
const PRIORITIES = ["low", "moderate", "high", "urgent"];

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}
function labelDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function Scheduling() {
  const [mode, setMode] = useState<Mode>("crew");
  const [start, setStart] = useState(() => isoDate(new Date()));
  const [days, setDays] = useState(5);
  const [crews, setCrews] = useState<Row[]>([]);
  const [equipment, setEquipment] = useState<Row[]>([]);
  const [jobs, setJobs] = useState<Row[]>([]);
  const [blocks, setBlocks] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const dateList = useMemo(() => Array.from({ length: days }, (_, i) => addDays(start, i)), [start, days]);
  const endDate = dateList[dateList.length - 1];

  const loadBlocks = async () => {
    const { data } = await (supabase.from("con_schedule_blocks") as any)
      .select("*")
      .gte("scheduled_date", start)
      .lte("scheduled_date", endDate)
      .order("sort_order", { ascending: true });
    setBlocks((data ?? []) as Row[]);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      const [c, e, j] = await Promise.all([
        (supabase.from("con_crews") as any).select("*").order("name"),
        (supabase.from("con_equipment") as any).select("*").order("name"),
        (supabase.from("con_jobs") as any).select("id, name, job_number, stage").order("created_at", { ascending: false }),
      ]);
      if (!alive) return;
      setCrews((c.data ?? []) as Row[]);
      setEquipment((e.data ?? []) as Row[]);
      setJobs((j.data ?? []) as Row[]);
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loadBlocks().finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, days]);

  const resources = mode === "crew" ? crews : equipment;
  const resourceKey = mode === "crew" ? "crew_id" : "equipment_id";

  const visibleBlocks = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return blocks.filter((b) => {
      if (b.resource_type !== mode) return false;
      if (!needle) return true;
      const job = jobs.find((j) => j.id === b.job_id);
      return [b.title, b.phase, b.notes, job?.name, job?.job_number]
        .filter(Boolean).some((v: any) => String(v).toLowerCase().includes(needle));
    });
  }, [blocks, mode, q, jobs]);

  const stats = useMemo(() => {
    const total = visibleBlocks.length;
    const late = visibleBlocks.filter((b) => b.scheduled_date < isoDate(new Date()) && b.status !== "done").length;
    const hours = visibleBlocks.reduce((s, b) => s + Number(b.duration_hours || 0), 0);
    return { total, late, hours };
  }, [visibleBlocks]);

  const jobLabel = (id: string | null) => {
    const j = jobs.find((x) => x.id === id);
    return j ? `${j.job_number ?? ""} ${j.name}`.trim() : null;
  };

  const move = async (blockId: string, resourceId: string, date: string) => {
    const patch: Row = { scheduled_date: date, resource_type: mode, crew_id: null, equipment_id: null };
    patch[resourceKey] = resourceId;
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, ...patch } : b)));
    const { error } = await (supabase.from("con_schedule_blocks") as any).update(patch).eq("id", blockId);
    if (error) { alert(error.message); loadBlocks(); }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Field Ops</p>
          <h1 className="truncate text-lg font-semibold sm:text-xl">
            Scheduling — {mode === "crew" ? "All crews" : "All equipment"}
          </h1>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            <button
              onClick={() => setMode("crew")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${mode === "crew" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Users className="h-3.5 w-3.5" /> Crews
            </button>
            <button
              onClick={() => setMode("equipment")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${mode === "equipment" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Truck className="h-3.5 w-3.5" /> Equipment
            </button>
          </div>
          {stats.late > 0 && (
            <span className="rounded-lg bg-destructive px-2.5 py-1.5 text-xs font-medium text-destructive-foreground">
              {stats.late} late
            </span>
          )}
          <span className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground">
            {stats.total} blocks · {stats.hours} hrs
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              aria-label="Search schedule"
              className="w-40 rounded-lg border border-border bg-card py-1.5 pl-8 pr-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-2">
        <button onClick={() => setStart(addDays(start, -days))} aria-label="Previous days" className="rounded-md border border-border p-1.5 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
        <button onClick={() => setStart(isoDate(new Date()))} className="rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-muted">Today</button>
        <button onClick={() => setStart(addDays(start, days))} aria-label="Next days" className="rounded-md border border-border p-1.5 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
        <input type="date" value={start} onChange={(e) => e.target.value && setStart(e.target.value)} aria-label="Start date" className="rounded-md border border-border bg-card px-2 py-1.5 text-xs" />
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Days shown" className="rounded-md border border-border bg-card px-2 py-1.5 text-xs">
          {[3, 5, 7, 14].map((n) => <option key={n} value={n}>{n} days</option>)}
        </select>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarRange className="h-3.5 w-3.5" /> {labelDate(start)} → {labelDate(endDate)}</span>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : resources.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
          No {mode === "crew" ? "crews" : "equipment"} yet. Add them in {mode === "crew" ? "Crews & Dispatch" : "Equipment & Fleet"} first.
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto p-4">
          {resources.map((res) => {
            const own = visibleBlocks.filter((b) => b[resourceKey] === res.id);
            const backlogHrs = own.reduce((s, b) => s + Number(b.duration_hours || 0), 0);
            return (
              <section key={res.id} className="flex w-72 shrink-0 flex-col rounded-2xl border border-border bg-card">
                <header className="border-b border-border px-3 py-2.5">
                  <h2 className="truncate text-sm font-semibold">{res.name}</h2>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {mode === "crew"
                      ? `${res.trade ?? "Crew"} · ${res.size ?? 0} people`
                      : `${res.category ?? "Equipment"} · ${res.status ?? "—"}`}
                    {" · "}Backlog {backlogHrs} hrs
                  </p>
                </header>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2.5">
                  {dateList.map((date) => {
                    const dayBlocks = own.filter((b) => b.scheduled_date === date);
                    return (
                      <div
                        key={date}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); if (dragId) move(dragId, res.id, date); setDragId(null); }}
                        className="rounded-xl border border-dashed border-border/70 p-1.5"
                      >
                        <div className="flex items-center justify-between px-1 pb-1.5">
                          <span className="text-[11px] font-medium text-muted-foreground">{labelDate(date)}</span>
                          <button
                            aria-label={`Add block on ${labelDate(date)}`}
                            onClick={() => setEditing({
                              resource_type: mode, [resourceKey]: res.id, scheduled_date: date,
                              title: "", duration_hours: 8, status: "scheduled", priority: "moderate", job_id: "",
                            })}
                            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {dayBlocks.length === 0 ? (
                          <p className="px-1 pb-1 text-[11px] text-muted-foreground/70">Open</p>
                        ) : (
                          <ul className="space-y-1.5">
                            {dayBlocks.map((b) => (
                              <li key={b.id}>
                                <button
                                  draggable
                                  onDragStart={() => setDragId(b.id)}
                                  onDragEnd={() => setDragId(null)}
                                  onClick={() => setEditing(b)}
                                  className="w-full cursor-grab rounded-lg border border-border bg-background p-2 text-left hover:border-primary/50 active:cursor-grabbing"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="truncate text-sm font-medium">{b.title}</span>
                                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{Number(b.duration_hours || 0)}h</span>
                                  </div>
                                  <div className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLE[b.status] ?? STATUS_STYLE.scheduled}`}>
                                    {String(b.status).replace(/_/g, " ")}
                                  </div>
                                  <p className="mt-1 truncate text-[11px] text-muted-foreground">
                                    {jobLabel(b.job_id) ?? "No job"}{b.phase ? ` · ${b.phase}` : ""}
                                  </p>
                                  {b.priority && b.priority !== "moderate" && (
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Priority: {b.priority}</p>
                                  )}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {editing && (
        <BlockDialog
          block={editing}
          jobs={jobs}
          crews={crews}
          equipment={equipment}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); loadBlocks(); }}
        />
      )}
    </div>
  );
}

function BlockDialog({ block, jobs, crews, equipment, onClose, onSaved }: {
  block: Row; jobs: Row[]; crews: Row[]; equipment: Row[]; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState<Row>({ ...block });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const isEdit = Boolean(block.id);
  const mode: Mode = form.resource_type === "equipment" ? "equipment" : "crew";

  const save = async () => {
    if (!String(form.title || "").trim()) return;
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const payload: Row = {
        job_id: form.job_id || null,
        resource_type: mode,
        crew_id: mode === "crew" ? form.crew_id || null : null,
        equipment_id: mode === "equipment" ? form.equipment_id || null : null,
        title: form.title,
        phase: form.phase || null,
        scheduled_date: form.scheduled_date,
        start_time: form.start_time || null,
        duration_hours: Number(form.duration_hours || 0),
        status: form.status,
        priority: form.priority,
        notes: form.notes || null,
      };
      const res = isEdit
        ? await (supabase.from("con_schedule_blocks") as any).update(payload).eq("id", block.id)
        : await (supabase.from("con_schedule_blocks") as any).insert({ ...payload, created_by: u.user?.id });
      if (res.error) { alert(res.error.message); return; }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!isEdit) return;
    setSaving(true);
    const { error } = await (supabase.from("con_schedule_blocks") as any).delete().eq("id", block.id);
    setSaving(false);
    if (error) { alert(error.message); return; }
    onSaved();
  };

  const cls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit schedule block" : "New schedule block"}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{isEdit ? "Edit block" : "Schedule work"}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Work</span>
            <input className={cls} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="Pour footings, set forms…" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Job</span>
            <select className={cls} value={form.job_id ?? ""} onChange={(e) => set("job_id", e.target.value)}>
              <option value="">No job</option>
              {jobs.map((j) => <option key={j.id} value={j.id}>{`${j.job_number ?? ""} ${j.name}`.trim()}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Resource</span>
            <select
              className={cls}
              value={mode === "crew" ? form.crew_id ?? "" : form.equipment_id ?? ""}
              onChange={(e) => set(mode === "crew" ? "crew_id" : "equipment_id", e.target.value)}
            >
              <option value="">—</option>
              {(mode === "crew" ? crews : equipment).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Phase</span>
            <input className={cls} value={form.phase ?? ""} onChange={(e) => set("phase", e.target.value)} placeholder="Sitework, framing…" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Date</span>
            <input type="date" className={cls} value={form.scheduled_date ?? ""} onChange={(e) => set("scheduled_date", e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Start time</span>
            <input type="time" className={cls} value={form.start_time ?? ""} onChange={(e) => set("start_time", e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Duration (hrs)</span>
            <input type="number" step="0.5" className={cls} value={form.duration_hours ?? 8} onChange={(e) => set("duration_hours", e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</span>
            <select className={cls} value={form.status ?? "scheduled"} onChange={(e) => set("status", e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Priority</span>
            <select className={cls} value={form.priority ?? "moderate"} onChange={(e) => set("priority", e.target.value)}>
              {PRIORITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Notes</span>
            <textarea rows={3} className={cls} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
          </label>
        </div>
        <div className="mt-5 flex items-center justify-between gap-2">
          {isEdit ? (
            <button onClick={remove} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg border border-border px-3.5 py-2 text-sm hover:bg-muted">Cancel</button>
            <button onClick={save} disabled={saving || !String(form.title || "").trim()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_hq/scheduling")({
  head: () => ({ meta: [{ title: "Scheduling — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: Scheduling,
});
