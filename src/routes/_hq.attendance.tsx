import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserMention } from "@/components/hq/UserMention";
import { toast } from "@/lib/hq/notify";
import { Clock, Users, CalendarDays, Timer, Check, X } from "lucide-react";

type Punch = {
  id: string;
  user_id: string;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  break_started_at: string | null;
  project: string | null;
};

type Leave = {
  id: string;
  user_id: string | null;
  type: string;
  start_date: string;
  end_date: string;
  days: number | null;
  status: string | null;
  reason: string | null;
};

type Profile = { id: string; full_name: string | null; department: string | null };

function punchSeconds(p: Punch, now: number) {
  const end = p.clock_out ? new Date(p.clock_out).getTime() : now;
  const gross = (end - new Date(p.clock_in).getTime()) / 1000;
  let br = Number(p.break_minutes || 0) * 60;
  if (!p.clock_out && p.break_started_at) br += (now - new Date(p.break_started_at).getTime()) / 1000;
  return Math.max(0, gross - br);
}

const STATUS_TONE: Record<string, string> = {
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  approved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  denied: "border-destructive/20 bg-destructive/10 text-destructive",
  cancelled: "border-border bg-muted/40 text-muted-foreground",
};

function AttendancePage() {
  const [tab, setTab] = useState<"today" | "timesheets" | "leave">("today");
  const [punches, setPunches] = useState<Punch[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [days, setDays] = useState(7);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async () => {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);
    const [{ data: p }, { data: l }, { data: pr }, { data: u }] = await Promise.all([
      (supabase.from("hr_time_clock") as any).select("*").gte("clock_in", since.toISOString()).order("clock_in", { ascending: false }),
      (supabase.from("hr_time_off") as any).select("id, user_id, type, start_date, end_date, days, status, reason").order("start_date", { ascending: false }).limit(200),
      (supabase.from("profiles") as any).select("id, full_name, department"),
      supabase.auth.getUser(),
    ]);
    setPunches((p ?? []) as Punch[]);
    setLeaves((l ?? []) as Leave[]);
    setProfiles((pr ?? []) as Profile[]);
    setMe(u.user?.id ?? null);
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const nameOf = useCallback((id: string | null) => profiles.find((p) => p.id === id)?.full_name ?? "Unknown", [profiles]);

  const onShift = useMemo(() => punches.filter((p) => !p.clock_out), [punches]);
  const todayPunches = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    return punches.filter((p) => new Date(p.clock_in).getTime() >= d.getTime());
  }, [punches]);
  const hoursToday = todayPunches.reduce((s, p) => s + punchSeconds(p, now), 0) / 3600;
  const pendingLeave = leaves.filter((l) => (l.status ?? "pending") === "pending");

  const perPerson = useMemo(() => {
    const map = new Map<string, { seconds: number; shifts: number }>();
    for (const p of punches) {
      const cur = map.get(p.user_id) ?? { seconds: 0, shifts: 0 };
      map.set(p.user_id, { seconds: cur.seconds + punchSeconds(p, now), shifts: cur.shifts + 1 });
    }
    return Array.from(map.entries()).sort((a, b) => b[1].seconds - a[1].seconds);
  }, [punches, now]);

  async function decide(l: Leave, status: "approved" | "denied") {
    const { error } = await (supabase.from("hr_time_off") as any).update({ status, approver_id: me }).eq("id", l.id);
    if (error) return toast.error(error.message);
    toast.success(`Request ${status}`);
    load();
  }

  const kpis = [
    { label: "On shift now", value: onShift.length, icon: Users },
    { label: "Hours today", value: hoursToday.toFixed(1), icon: Clock },
    { label: `Hours last ${days}d`, value: (punches.reduce((s, p) => s + punchSeconds(p, now), 0) / 3600).toFixed(1), icon: Timer },
    { label: "Leave awaiting review", value: pendingLeave.length, icon: CalendarDays },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] px-6 py-6">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">People &amp; Operations</p>
        <h1 className="text-2xl font-semibold tracking-tight">Attendance &amp; Leave</h1>
        <p className="text-sm text-muted-foreground">Live clock-ins, timesheets and leave approvals across the company.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/40 p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wide">{k.label}</span>
              <k.icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-border bg-card p-1 text-sm">
          {([["today", "On shift"], ["timesheets", "Timesheets"], ["leave", "Leave requests"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`rounded-lg px-3 py-1.5 ${tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{label}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Range
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Date range" className="rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground">
            <option value={1}>Today</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </label>
      </div>

      {tab === "today" && (
        <section className="mt-4 rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4 text-sm font-semibold">Currently clocked in ({onShift.length})</div>
          <div className="divide-y divide-border">
            {onShift.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nobody is on the clock right now.</p>}
            {onShift.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-3">
                  <UserMention userId={p.user_id} name={nameOf(p.user_id)} />
                  <span className="text-xs text-muted-foreground">{p.project ?? "General"}</span>
                  {p.break_started_at && <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-600">On break</span>}
                </div>
                <div className="text-sm text-muted-foreground">
                  In {new Date(p.clock_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
                  <span className="font-semibold text-foreground">{(punchSeconds(p, now) / 3600).toFixed(2)}h</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "timesheets" && (
        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4 text-sm font-semibold">Hours by person</div>
            <div className="divide-y divide-border">
              {perPerson.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No punches in this range.</p>}
              {perPerson.map(([uid, v]) => (
                <div key={uid} className="flex items-center justify-between px-5 py-3">
                  <UserMention userId={uid} name={nameOf(uid)} />
                  <span className="text-sm"><span className="font-semibold">{(v.seconds / 3600).toFixed(2)}h</span> <span className="text-muted-foreground">· {v.shifts} shifts</span></span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4 text-sm font-semibold">Punch log</div>
            <div className="max-h-[520px] divide-y divide-border overflow-auto">
              {punches.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <UserMention userId={p.user_id} name={nameOf(p.user_id)} size="xs" />
                    <span className="text-xs text-muted-foreground">{new Date(p.clock_in).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(p.clock_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                    {p.clock_out ? new Date(p.clock_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "ongoing"} ·{" "}
                    <span className="font-semibold text-foreground">{(punchSeconds(p, now) / 3600).toFixed(2)}h</span>
                  </span>
                </div>
              ))}
              {punches.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No punches in this range.</p>}
            </div>
          </div>
        </section>
      )}

      {tab === "leave" && (
        <section className="mt-4 rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4 text-sm font-semibold">Leave requests</div>
          <div className="divide-y divide-border">
            {leaves.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No leave requests.</p>}
            {leaves.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-[220px]">
                  <div className="flex items-center gap-2">
                    {l.user_id ? <UserMention userId={l.user_id} name={nameOf(l.user_id)} size="xs" /> : <span className="text-sm">Unassigned</span>}
                    <span className="text-sm font-medium capitalize">{l.type}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{l.start_date} → {l.end_date} · {l.days ?? "—"} days{l.reason ? ` · ${l.reason}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] capitalize ${STATUS_TONE[l.status ?? "pending"] ?? ""}`}>{l.status ?? "pending"}</span>
                  {(l.status ?? "pending") === "pending" && (
                    <>
                      <button onClick={() => decide(l, "approved")} aria-label="Approve request" className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-500/20">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                      </button>
                      <button onClick={() => decide(l, "denied")} aria-label="Deny request" className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20">
                        <X className="h-3.5 w-3.5" aria-hidden="true" /> Deny
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_hq/attendance")({
  head: () => ({ meta: [{ title: "Attendance & Leave — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: AttendancePage,
});
