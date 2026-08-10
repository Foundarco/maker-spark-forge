import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Timer, Pause, Play, LogOut, CalendarDays, Plus, Clock } from "lucide-react";
import { toast } from "@/lib/hq/notify";

type Punch = {
  id: string;
  user_id: string;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  break_started_at: string | null;
  project: string | null;
  notes: string | null;
};

type Leave = {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  days: number | null;
  status: string | null;
  reason: string | null;
};

const PLANNED_WEEKLY = 40;

function hms(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return { h, m, sec };
}

function punchSeconds(p: Punch, now: number) {
  const end = p.clock_out ? new Date(p.clock_out).getTime() : now;
  const gross = (end - new Date(p.clock_in).getTime()) / 1000;
  let breakSec = Number(p.break_minutes || 0) * 60;
  if (!p.clock_out && p.break_started_at) breakSec += (now - new Date(p.break_started_at).getTime()) / 1000;
  return Math.max(0, gross - breakSec);
}

function startOfWeek(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

const LEAVE_TYPES = ["vacation", "sick", "personal", "bereavement", "parental", "unpaid"];

const STATUS_TONE: Record<string, string> = {
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  approved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  denied: "border-destructive/20 bg-destructive/10 text-destructive",
  cancelled: "border-border bg-muted/40 text-muted-foreground",
};

function MyTimePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [punches, setPunches] = useState<Punch[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [project, setProject] = useState("");
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [showLeave, setShowLeave] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async (uid: string) => {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const [{ data: p }, { data: l }] = await Promise.all([
      (supabase.from("hr_time_clock") as any).select("*").eq("user_id", uid).gte("clock_in", since.toISOString()).order("clock_in", { ascending: false }),
      (supabase.from("hr_time_off") as any).select("id, type, start_date, end_date, days, status, reason").eq("user_id", uid).order("start_date", { ascending: false }).limit(20),
    ]);
    setPunches((p ?? []) as Punch[]);
    setLeaves((l ?? []) as Leave[]);
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid || !live) return;
      setUserId(uid);
      const { data: prof } = await (supabase.from("profiles") as any).select("full_name, department").eq("id", uid).maybeSingle();
      if (!live) return;
      setName(prof?.full_name ?? u.user?.email ?? "there");
      setRole(prof?.department ?? "Team member");
      await load(uid);
    })();
    return () => { live = false; };
  }, [load]);

  const active = punches.find((p) => !p.clock_out) ?? null;
  const activeSeconds = active ? punchSeconds(active, now) : 0;
  const onBreak = !!active?.break_started_at;

  const weekSeconds = useMemo(() => {
    const ws = startOfWeek().getTime();
    return punches.filter((p) => new Date(p.clock_in).getTime() >= ws).reduce((s, p) => s + punchSeconds(p, now), 0);
  }, [punches, now]);

  const daysThisWeek = useMemo(() => {
    const ws = startOfWeek().getTime();
    return new Set(punches.filter((p) => new Date(p.clock_in).getTime() >= ws).map((p) => new Date(p.clock_in).toDateString())).size;
  }, [punches]);

  const byDay = useMemo(() => {
    const map = new Map<string, Punch[]>();
    for (const p of punches) {
      const k = new Date(p.clock_in).toDateString();
      map.set(k, [...(map.get(k) ?? []), p]);
    }
    return Array.from(map.entries()).slice(0, 7);
  }, [punches]);

  async function clockIn() {
    if (!userId || busy) return;
    setBusy(true);
    const { error } = await (supabase.from("hr_time_clock") as any).insert({ user_id: userId, project: project || null });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Clocked in");
    load(userId);
  }

  async function toggleBreak() {
    if (!active || !userId || busy) return;
    setBusy(true);
    const patch = active.break_started_at
      ? { break_started_at: null, break_minutes: Number(active.break_minutes || 0) + (Date.now() - new Date(active.break_started_at).getTime()) / 60000 }
      : { break_started_at: new Date().toISOString() };
    const { error } = await (supabase.from("hr_time_clock") as any).update(patch).eq("id", active.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    load(userId);
  }

  async function clockOut() {
    if (!active || !userId || busy) return;
    setBusy(true);
    const extra = active.break_started_at ? (Date.now() - new Date(active.break_started_at).getTime()) / 60000 : 0;
    const worked = punchSeconds(active, Date.now()) / 3600;
    const { error } = await (supabase.from("hr_time_clock") as any)
      .update({ clock_out: new Date().toISOString(), break_started_at: null, break_minutes: Number(active.break_minutes || 0) + extra })
      .eq("id", active.id);
    if (!error) {
      await (supabase.from("hr_time_entries") as any).insert({
        user_id: userId,
        entry_date: new Date(active.clock_in).toISOString().slice(0, 10),
        hours: Number(worked.toFixed(2)),
        project: active.project ?? "General",
        task: "Clocked shift",
        billable: true,
        created_by: userId,
      });
    }
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Clocked out — ${worked.toFixed(2)} h logged`);
    load(userId);
  }

  const t = hms(activeSeconds);
  const weekPct = Math.min(100, (weekSeconds / 3600 / PLANNED_WEEKLY) * 100);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-6 py-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">People &amp; Operations</p>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome, {name}</h1>
          <p className="text-sm text-muted-foreground">{role} · {new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p>
        </div>
        <button
          onClick={() => setShowLeave(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Request leave
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Clock card */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3 text-sm font-semibold">
            <Timer className="h-4 w-4 text-primary" aria-hidden="true" /> Clock-in
          </div>
          <div className="py-2 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {active ? (onBreak ? "On break" : "Ongoing") : "Not clocked in"}
            </p>
            <p className="mt-2 font-mono text-4xl font-semibold tabular-nums">
              {t.h}:{t.m}<span className="text-muted-foreground">:{t.sec}</span>
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {active ? (
                <>
                  <button onClick={toggleBreak} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">
                    {onBreak ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
                    {onBreak ? "Resume" : "Break"}
                  </button>
                  <button onClick={clockOut} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50">
                    <LogOut className="h-4 w-4" aria-hidden="true" /> Clock-out
                  </button>
                </>
              ) : (
                <button onClick={clockIn} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
                  <Play className="h-4 w-4" aria-hidden="true" /> Clock in
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <label htmlFor="mytime-project" className="text-xs font-medium text-muted-foreground">Job / project (optional)</label>
            <input
              id="mytime-project"
              value={active?.project ?? project}
              onChange={(e) => setProject(e.target.value)}
              disabled={!!active}
              placeholder="What are you working on…"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm disabled:opacity-60"
            />
          </div>
        </section>

        {/* Planned hours */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3 text-sm font-semibold">
            <Clock className="h-4 w-4 text-primary" aria-hidden="true" /> Planned hours
          </div>
          <p className="text-sm text-muted-foreground">Total hours (weekly)</p>
          <p className="text-3xl font-semibold">{PLANNED_WEEKLY}<span className="ml-1 text-base text-muted-foreground">hrs</span></p>
          <p className="mt-4 text-sm text-muted-foreground">Days worked this week</p>
          <p className="text-3xl font-semibold">{daysThisWeek}<span className="ml-1 text-base text-muted-foreground">days</span></p>
          <p className="mt-4 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">Each employee should complete their weekly planned hours.</p>
        </section>

        {/* Worked hours */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3 text-sm font-semibold">
            <Timer className="h-4 w-4 text-primary" aria-hidden="true" /> Worked hours
          </div>
          <div className="rounded-2xl bg-muted/40 p-6 text-center">
            <p className="text-sm text-muted-foreground">Total hours (this week)</p>
            <p className="mt-1 text-4xl font-semibold tabular-nums">
              {Math.floor(weekSeconds / 3600)}<span className="text-base text-muted-foreground">hrs</span> {Math.floor((weekSeconds % 3600) / 60)}<span className="text-base text-muted-foreground">mins</span>
            </p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-primary" style={{ width: `${weekPct}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{weekPct.toFixed(0)}% of planned</p>
          </div>
        </section>
      </div>

      {/* Timesheets */}
      <section className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">My timesheets</h2>
          <span className="text-xs text-muted-foreground">Last 7 worked days</span>
        </div>
        <div className="divide-y divide-border">
          {byDay.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No shifts recorded yet.</p>}
          {byDay.map(([day, items]) => {
            const total = items.reduce((s, p) => s + punchSeconds(p, now), 0);
            const first = items[items.length - 1]!;
            const last = items[0]!;
            return (
              <div key={day} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{new Date(day).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</p>
                  <p className="text-sm text-muted-foreground">Duration: <span className="font-semibold text-foreground">{(total / 3600).toFixed(2)}h</span></p>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>In {new Date(first.clock_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (total / 3600 / 8) * 100)}%` }} />
                  </div>
                  <span>{last.clock_out ? `Out ${new Date(last.clock_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Ongoing"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Leave */}
      <section className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" /> My leave requests</h2>
          <button onClick={() => setShowLeave(true)} className="text-xs font-medium text-primary hover:underline">New request</button>
        </div>
        <div className="divide-y divide-border">
          {leaves.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No leave requests yet.</p>}
          {leaves.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div>
                <p className="text-sm font-medium capitalize">{l.type}</p>
                <p className="text-xs text-muted-foreground">{l.start_date} → {l.end_date} · {l.days ?? "—"} days</p>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[11px] capitalize ${STATUS_TONE[l.status ?? "pending"] ?? ""}`}>{l.status ?? "pending"}</span>
            </div>
          ))}
        </div>
      </section>

      {showLeave && userId && (
        <LeaveDialog userId={userId} onClose={() => setShowLeave(false)} onSaved={() => { setShowLeave(false); load(userId); }} />
      )}
    </div>
  );
}

function LeaveDialog({ userId, onClose, onSaved }: { userId: string; onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState("vacation");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const days = useMemo(() => {
    if (!start || !end) return 0;
    const d = (new Date(end).getTime() - new Date(start).getTime()) / 86400000 + 1;
    return d > 0 ? d : 0;
  }, [start, end]);

  async function submit() {
    if (!start || !end) return toast.error("Pick a start and end date");
    setSaving(true);
    const { error } = await (supabase.from("hr_time_off") as any).insert({
      user_id: userId, type, start_date: start, end_date: end, days, reason: reason || null, status: "pending", created_by: userId,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Leave request submitted");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Request leave">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
        <h3 className="text-base font-semibold">Request leave</h3>
        <div className="mt-4 grid gap-3">
          <div>
            <label htmlFor="leave-type" className="text-xs font-medium text-muted-foreground">Type</label>
            <select id="leave-type" value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm capitalize">
              {LEAVE_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="leave-start" className="text-xs font-medium text-muted-foreground">Start</label>
              <input id="leave-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="leave-end" className="text-xs font-medium text-muted-foreground">End</label>
              <input id="leave-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{days} day{days === 1 ? "" : "s"} requested</p>
          <div>
            <label htmlFor="leave-reason" className="text-xs font-medium text-muted-foreground">Reason</label>
            <textarea id="leave-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button onClick={submit} disabled={saving} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">Submit</button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_hq/my-time")({
  head: () => ({ meta: [{ title: "My Time — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: MyTimePage,
});
