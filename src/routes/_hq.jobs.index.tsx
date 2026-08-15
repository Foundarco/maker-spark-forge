import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { HardHat, Plus, Search, Loader2, AlertTriangle, Activity, CheckCircle2, Coins, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UserMention } from "@/components/hq/UserMention";

type Row = Record<string, any>;

const STAGES = ["lead", "preconstruction", "contract", "active", "closeout", "complete"] as const;

const STAGE_STYLE: Record<string, string> = {
  lead: "border-border bg-muted/50 text-muted-foreground",
  preconstruction: "border-blue-200 bg-blue-50 text-blue-700",
  contract: "border-indigo-200 bg-indigo-50 text-indigo-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  closeout: "border-amber-200 bg-amber-50 text-amber-700",
  complete: "border-border bg-muted/50 text-muted-foreground",
};

function money(n: any) {
  return `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
}
function daysFromToday(d: string | null) {
  if (!d) return null;
  const ms = new Date(d).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}

function JobsDashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [clients, setClients] = useState<Row[]>([]);
  const [profiles, setProfiles] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("open");
  const [showNew, setShowNew] = useState(false);

  const load = async () => {
    const [j, c, p] = await Promise.all([
      (supabase.from("con_jobs") as any).select("*").order("created_at", { ascending: false }),
      (supabase.from("con_clients") as any).select("id, name, company"),
      supabase.from("profiles").select("id, full_name, email"),
    ]);
    setRows((j.data ?? []) as Row[]);
    setClients((c.data ?? []) as Row[]);
    setProfiles((p.data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const kpis = useMemo(() => {
    const open = rows.filter((r) => !["complete"].includes(r.stage));
    const late = open.filter((r) => {
      const d = daysFromToday(r.target_end_date);
      return d != null && d < 0;
    });
    const active = rows.filter((r) => r.stage === "active");
    const closeout = rows.filter((r) => r.stage === "closeout");
    const backlog = open.reduce((s, r) => s + Number(r.contract_value || 0) - Number(r.billed || 0), 0);
    const avgLate = late.length
      ? Math.round(late.reduce((s, r) => s + Math.abs(daysFromToday(r.target_end_date) || 0), 0) / late.length)
      : 0;
    return [
      { label: "Late jobs", count: late.length, sub: late.length ? `~${avgLate} days late` : "On schedule", icon: AlertTriangle, grad: "from-rose-500 to-red-600" },
      { label: "In progress", count: active.length, sub: `${open.length} open jobs`, icon: Activity, grad: "from-blue-500 to-indigo-600" },
      { label: "Closeout", count: closeout.length, sub: "Punch & final billing", icon: CheckCircle2, grad: "from-amber-500 to-orange-600" },
      { label: "Unbilled backlog", count: money(backlog), sub: `${money(open.reduce((s, r) => s + Number(r.contract_value || 0), 0))} contracted`, icon: Coins, grad: "from-emerald-500 to-teal-600" },
    ];
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (stage === "open" ? r.stage === "complete" : stage !== "all" && r.stage !== stage) return false;
      if (!needle) return true;
      return [r.name, r.job_number, r.address, r.city, r.job_type, r.division]
        .filter(Boolean).some((v: any) => String(v).toLowerCase().includes(needle));
    });
  }, [rows, q, stage]);

  const clientName = (id: string | null) => {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : "—";
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] p-5 lg:p-7">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Field Ops</p>
          <h1 className="truncate text-xl font-semibold sm:text-2xl">Jobs</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link to="/scheduling" className="rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-muted">
            Scheduling
          </Link>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New job
          </button>
        </div>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-2xl bg-gradient-to-br ${k.grad} p-4 text-white shadow-sm`}>
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/80">{k.label}</p>
              <k.icon className="h-4 w-4 text-white/80" />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums">{k.count}</p>
            <p className="mt-0.5 text-sm text-white/85">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search jobs, numbers, addresses…"
            aria-label="Search jobs"
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          aria-label="Filter by stage"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="open">Open</option>
          <option value="all">All stages</option>
          {STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No jobs match this view.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Job</th>
                  <th className="px-4 py-2.5 font-medium">Client</th>
                  <th className="px-4 py-2.5 font-medium">Location</th>
                  <th className="px-4 py-2.5 font-medium">PM</th>
                  <th className="px-4 py-2.5 font-medium">Contract</th>
                  <th className="px-4 py-2.5 font-medium">Target</th>
                  <th className="px-4 py-2.5 font-medium">Progress</th>
                  <th className="px-4 py-2.5 font-medium">Stage</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const d = daysFromToday(r.target_end_date);
                  const late = d != null && d < 0 && r.stage !== "complete";
                  const pm = profiles.find((p) => p.id === r.project_manager_id);
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <Link to="/jobs/$id" params={{ id: r.id }} className="block">
                          <span className="font-mono text-[11px] text-muted-foreground">{r.job_number ?? "—"}</span>
                          <span className="block font-medium text-primary hover:underline">{r.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs">{clientName(r.client_id)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{[r.city, r.state].filter(Boolean).join(", ") || "—"}</td>
                      <td className="px-4 py-3 text-xs">
                        {pm ? <UserMention userId={pm.id} name={pm.full_name || pm.email || "User"} /> : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs tabular-nums">{money(r.contract_value)}</td>
                      <td className="px-4 py-3 text-xs">
                        <div className={late ? "font-medium text-destructive" : ""}>{fmt(r.target_end_date)}</div>
                        {d != null && <div className={`text-[11px] ${late ? "text-destructive" : "text-muted-foreground"}`}>{d < 0 ? `${Math.abs(d)} days late` : `${d} days out`}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div className={`h-full rounded-full ${late ? "bg-destructive" : "bg-primary"}`} style={{ width: `${Math.min(100, Number(r.percent_complete || 0))}%` }} />
                          </div>
                          <span className="font-mono text-[11px] tabular-nums">{Number(r.percent_complete || 0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] capitalize ${STAGE_STYLE[r.stage] ?? STAGE_STYLE.lead}`}>
                          {String(r.stage ?? "—").replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNew && (
        <NewJobDialog
          clients={clients}
          profiles={profiles}
          count={rows.length}
          onClose={() => setShowNew(false)}
          onCreated={(id) => navigate({ to: "/jobs/$id", params: { id } })}
        />
      )}
    </div>
  );
}

function NewJobDialog({ clients, profiles, count, onClose, onCreated }: {
  clients: Row[]; profiles: Row[]; count: number; onClose: () => void; onCreated: (id: string) => void;
}) {
  const [form, setForm] = useState<Row>({
    name: "",
    job_number: `J-${new Date().getFullYear().toString().slice(2)}-${String(count + 1).padStart(4, "0")}`,
    client_id: "", job_type: "", division: "", stage: "preconstruction",
    contract_value: "", start_date: "", target_end_date: "", project_manager_id: "", address: "", city: "", state: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const payload: Row = { ...form, created_by: u.user?.id };
      for (const k of Object.keys(payload)) if (payload[k] === "") payload[k] = null;
      payload.contract_value = Number(form.contract_value || 0);
      const { data, error } = await (supabase.from("con_jobs") as any).insert(payload).select("id").single();
      if (error) { alert(error.message); return; }
      onCreated(data.id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" role="dialog" aria-modal="true" aria-label="New job">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">New job</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Job name" full><input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Job number"><input className={inputCls} value={form.job_number} onChange={(e) => set("job_number", e.target.value)} /></Field>
          <Field label="Client">
            <select className={inputCls} value={form.client_id} onChange={(e) => set("client_id", e.target.value)}>
              <option value="">—</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.company || c.name}</option>)}
            </select>
          </Field>
          <Field label="Job type"><input className={inputCls} value={form.job_type} onChange={(e) => set("job_type", e.target.value)} /></Field>
          <Field label="Division"><input className={inputCls} value={form.division} onChange={(e) => set("division", e.target.value)} /></Field>
          <Field label="Contract value ($)"><input type="number" className={inputCls} value={form.contract_value} onChange={(e) => set("contract_value", e.target.value)} /></Field>
          <Field label="Stage">
            <select className={inputCls} value={form.stage} onChange={(e) => set("stage", e.target.value)}>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Start date"><input type="date" className={inputCls} value={form.start_date} onChange={(e) => set("start_date", e.target.value)} /></Field>
          <Field label="Target end"><input type="date" className={inputCls} value={form.target_end_date} onChange={(e) => set("target_end_date", e.target.value)} /></Field>
          <Field label="Project manager">
            <select className={inputCls} value={form.project_manager_id} onChange={(e) => set("project_manager_id", e.target.value)}>
              <option value="">—</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
            </select>
          </Field>
          <Field label="Address" full><input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
          <Field label="City"><input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="State"><input className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border px-3.5 py-2 text-sm hover:bg-muted">Cancel</button>
          <button onClick={save} disabled={saving || !form.name.trim()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create job
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export const Route = createFileRoute("/_hq/jobs/")({
  head: () => ({ meta: [{ title: "Jobs — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: JobsDashboard,
});
