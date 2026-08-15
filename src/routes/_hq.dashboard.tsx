import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, Users, HardHat, Truck, ShieldAlert, DollarSign, ClipboardList,
  Hash, Bell, Calendar, ArrowUpRight, MessageSquare, AlertTriangle, Building2,
  FileSignature, CheckCircle2, Wrench,
} from "lucide-react";
import { UserMention } from "@/components/hq/UserMention";

export const Route = createFileRoute("/_hq/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Clovr Labs HQ" },
      { name: "description", content: "Organization-wide view of incidents, response teams, safety, fleet and funding for Clovr Labs." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

type Focus = "exec" | "precon" | "pm" | "field" | "materials" | "safety" | "finance" | "people" | "client";

const FOCUS_LABEL: Record<Focus, string> = {
  exec: "Executive",
  precon: "Engineering",
  pm: "Mission Management",
  field: "Mission Ops",
  materials: "Fleet & Supply",
  safety: "Safety & Quality",
  finance: "Funding",
  people: "People",
  client: "Research & Partners",
};

function focusFromText(text: string, add: (f: Focus) => void) {
  const t = text.toLowerCase();
  if (!t) return;
  if (/(exec|owner|president|admin|super)/.test(t)) add("exec");
  if (/(estimat|precon|bid|sales)/.test(t)) add("precon");
  if (/(project|pm|superintend|operations|ops)/.test(t)) add("pm");
  if (/(field|crew|foreman|labor|carpent|concrete|excavat|landscape)/.test(t)) add("field");
  if (/(material|procure|purchas|supply|warehouse)/.test(t)) add("materials");
  if (/(safety|quality|qc|compliance)/.test(t)) add("safety");
  if (/(finance|account|payroll|book)/.test(t)) add("finance");
  if (/(hr|people|recruit|talent)/.test(t)) add("people");
  if (/(client|customer|service|support)/.test(t)) add("client");
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const money = (n: number) => `$${Math.round(n || 0).toLocaleString()}`;

function DashboardPage() {
  const [me, setMe] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [focus, setFocus] = useState<Focus[]>([]);
  const [d, setD] = useState<any>({});
  const [missed, setMissed] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setMe(u.user.id);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      setProfile(p);

      const set = new Set<Focus>();
      const add = (f: Focus) => set.add(f);
      const [{ data: cr }, { data: ur }, { data: emp }] = await Promise.all([
        supabase.from("user_custom_roles").select("custom_roles(name)").eq("user_id", u.user.id),
        supabase.from("user_roles").select("role").eq("user_id", u.user.id),
        supabase.from("hr_employees").select("title, department").eq("user_id", u.user.id).maybeSingle(),
      ]);
      (cr || []).forEach((r: any) => focusFromText(r.custom_roles?.name || "", add));
      (ur || []).forEach((r: any) => focusFromText(r.role || "", add));
      focusFromText(`${p?.department || ""} ${p?.title || ""}`, add);
      focusFromText(`${emp?.department || ""} ${emp?.title || ""}`, add);
      if ((ur || []).some((r: any) => ["super_admin", "admin"].includes(r.role))) {
        ["exec", "precon", "pm", "field", "materials", "safety", "finance", "people", "client"].forEach((f) => add(f as Focus));
      }
      if (set.size === 0) { add("pm"); add("field"); }
      setFocus(Array.from(set));
    })();
  }, []);

  useEffect(() => {
    if (!me) return;
    (async () => {
      const today = todayISO();
      const monthStart = new Date(); monthStart.setDate(1);
      const weekAhead = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
      const in30 = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
      const since = new Date(Date.now() - 864e5).toISOString();

      const [
        jobs, estimates, tasks, rfis, punch, incidents, deliveries, invoices,
        assignments, permits, certs, equipment, applicants, meetings, notifs, logs,
      ] = await Promise.all([
        supabase.from("con_jobs").select("id, name, job_number, stage, status, contract_value, actual_cost, billed, percent_complete, target_end_date, project_manager_id"),
        supabase.from("con_estimates").select("id, title, status, total, valid_until").order("updated_at", { ascending: false }).limit(50),
        supabase.from("con_tasks").select("id, title, status, priority, due_date, job_id, assignee_id").in("status", ["open", "in_progress", "blocked"]).order("due_date", { nullsFirst: false }).limit(100),
        supabase.from("con_submittals").select("id, kind, number, title, status, due_date, ball_in_court").neq("status", "closed").limit(60),
        supabase.from("con_punch_items").select("id, title, status, job_id, assignee_id").neq("status", "complete").limit(100),
        supabase.from("con_safety_incidents").select("id, incident_type, severity, incident_date, osha_reportable, job_id").gte("incident_date", monthStart.toISOString().slice(0, 10)),
        supabase.from("con_deliveries").select("id, material, supplier, expected_date, status, job_id").gte("expected_date", today).lte("expected_date", weekAhead).order("expected_date"),
        supabase.from("fin_invoices").select("id, total, status, due_date").limit(200),
        supabase.from("con_crew_assignments").select("id, crew_id, job_id, user_id, role, start_date, end_date, status, con_crews(name), con_jobs(name)").lte("start_date", today),
        supabase.from("con_permits").select("id, permit_type, status, expires_date, inspection_date, job_id").lte("expires_date", in30).not("expires_date", "is", null),
        supabase.from("hr_certifications").select("id, name, expires_date, user_id, employee_id").lte("expires_date", in30).not("expires_date", "is", null),
        supabase.from("con_equipment").select("id, name, status, next_service_date, hours_meter, next_service_hours"),
        supabase.from("hr_applicants").select("id, name, stage").limit(100),
        supabase.from("meetings").select("id, title, starts_at, host_id").gte("starts_at", new Date().toISOString()).lte("starts_at", new Date(new Date().setHours(23, 59, 59)).toISOString()).order("starts_at").limit(5),
        supabase.from("notifications").select("*").eq("user_id", me).is("read_at", null).order("created_at", { ascending: false }).limit(6),
        supabase.from("con_daily_logs").select("id, job_id, log_date, status").eq("log_date", today),
      ]);

      const J = jobs.data || [];
      const activeJobs = J.filter((j: any) => j.status === "active" || !["complete", "closed", "cancelled"].includes(j.status || ""));
      const contract = activeJobs.reduce((s: number, j: any) => s + Number(j.contract_value || 0), 0);
      const billed = activeJobs.reduce((s: number, j: any) => s + Number(j.billed || 0), 0);
      const cost = activeJobs.reduce((s: number, j: any) => s + Number(j.actual_cost || 0), 0);
      const onSite = (assignments.data || []).filter((a: any) => !a.end_date || a.end_date >= today);
      const myTasks = (tasks.data || []).filter((t: any) => t.assignee_id === me);
      const overdue = (tasks.data || []).filter((t: any) => t.due_date && t.due_date < today);
      const openRfis = (rfis.data || []);
      const outstanding = (invoices.data || []).filter((i: any) => i.status !== "paid").reduce((s: number, i: any) => s + Number(i.total || 0), 0);
      const dueEquipment = (equipment.data || []).filter((e: any) =>
        (e.next_service_date && e.next_service_date <= weekAhead) ||
        (e.next_service_hours && Number(e.hours_meter || 0) >= Number(e.next_service_hours)));

      const attention = [
        ...(permits.data || []).map((p: any) => ({ kind: "Permit", label: `${p.permit_type || "Permit"} expires ${p.expires_date}`, to: "/permits" })),
        ...(certs.data || []).map((c: any) => ({ kind: "Certification", label: `${c.name} expires ${c.expires_date}`, to: "/certifications" })),
        ...dueEquipment.map((e: any) => ({ kind: "Equipment", label: `${e.name} service due`, to: "/equipment" })),
        ...openRfis.filter((r: any) => r.due_date && r.due_date < today).map((r: any) => ({ kind: "RFI", label: `${r.number || r.title} overdue`, to: "/rfis" })),
        ...overdue.slice(0, 5).map((t: any) => ({ kind: "Task", label: `${t.title} overdue`, to: "/company-tasks" })),
      ].slice(0, 10);

      setD({
        activeJobs, contract, billed, cost, unbilled: contract - billed,
        crewsOnSite: new Set(onSite.map((a: any) => a.crew_id)).size,
        peopleOnSite: onSite.length,
        onSite: onSite.slice(0, 8),
        myTasks, tasks: tasks.data || [], overdue,
        openRfis, punch: punch.data || [],
        incidents: incidents.data || [],
        deliveries: deliveries.data || [],
        outstanding, attention,
        pendingEstimates: (estimates.data || []).filter((e: any) => ["draft", "sent", "pending"].includes(e.status || "")),
        estimateValue: (estimates.data || []).filter((e: any) => ["sent", "pending"].includes(e.status || "")).reduce((s: number, e: any) => s + Number(e.total || 0), 0),
        applicantsOpen: (applicants.data || []).filter((a: any) => !["hired", "rejected"].includes(a.stage || "")).length,
        meetings: meetings.data || [], notifs: notifs.data || [],
        logsToday: (logs.data || []).length,
      });

      const [chMsgs, dmMsgs] = await Promise.all([
        supabase.from("channel_messages").select("id, channel_id, author_id, body, created_at, mentions").gte("created_at", since).neq("author_id", me).order("created_at", { ascending: false }).limit(20),
        supabase.from("direct_messages").select("id, sender_id, recipient_id, body, created_at").gte("created_at", since).eq("recipient_id", me).order("created_at", { ascending: false }).limit(10),
      ]);
      const feed = [
        ...(chMsgs.data || []).map((m: any) => ({ ...m, _type: "channel" as const })),
        ...(dmMsgs.data || []).map((m: any) => ({ ...m, _type: "dm" as const })),
      ].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 10);
      setMissed(feed);

      const uids = new Set<string>();
      feed.forEach((m: any) => uids.add(m.author_id || m.sender_id));
      (meetings.data || []).forEach((x: any) => uids.add(x.host_id));
      (onSite || []).forEach((a: any) => a.user_id && uids.add(a.user_id));
      if (uids.size) {
        const { data: pp } = await supabase.from("profiles").select("id, full_name, email").in("id", Array.from(uids));
        const map: Record<string, any> = {};
        (pp || []).forEach((p: any) => { map[p.id] = p; });
        setProfiles(map);
      }
    })();
  }, [me]);

  const has = (f: Focus) => focus.includes(f);

  const kpiCards = useMemo(() => {
    const c: { label: string; value: string; icon: any; to: string; tone: string }[] = [];
    c.push({ label: "Active jobs", value: String(d.activeJobs?.length || 0), icon: Building2, to: "/jobs", tone: "text-primary bg-primary/10" });
    if (has("exec") || has("finance") || has("pm")) {
      c.push({ label: "Contract in progress", value: money(d.contract), icon: FileSignature, to: "/job-costing", tone: "text-emerald-600 bg-emerald-500/10" });
      c.push({ label: "Unbilled work", value: money(d.unbilled), icon: DollarSign, to: "/invoices", tone: "text-amber-600 bg-amber-500/10" });
    }
    if (has("finance")) c.push({ label: "Outstanding AR", value: money(d.outstanding), icon: DollarSign, to: "/invoices", tone: "text-rose-600 bg-rose-500/10" });
    if (has("precon")) {
      c.push({ label: "Bids out", value: money(d.estimateValue), icon: ClipboardList, to: "/quotes", tone: "text-blue-600 bg-blue-500/10" });
      c.push({ label: "Open estimates", value: String(d.pendingEstimates?.length || 0), icon: ClipboardList, to: "/quotes", tone: "text-primary bg-primary/10" });
    }
    if (has("field") || has("pm")) {
      c.push({ label: "Crews on site", value: String(d.crewsOnSite || 0), icon: HardHat, to: "/crews", tone: "text-orange-600 bg-orange-500/10" });
      c.push({ label: "Logs filed today", value: String(d.logsToday || 0), icon: ClipboardList, to: "/daily-logs", tone: "text-primary bg-primary/10" });
    }
    if (has("pm") || has("precon")) c.push({ label: "Open RFIs", value: String(d.openRfis?.length || 0), icon: MessageSquare, to: "/rfis", tone: "text-violet-600 bg-violet-500/10" });
    if (has("safety") || has("field")) c.push({ label: "Incidents this month", value: String(d.incidents?.length || 0), icon: ShieldAlert, to: "/safety", tone: "text-rose-600 bg-rose-500/10" });
    if (has("materials")) c.push({ label: "Deliveries this week", value: String(d.deliveries?.length || 0), icon: Truck, to: "/deliveries", tone: "text-blue-600 bg-blue-500/10" });
    if (has("people")) c.push({ label: "Open applicants", value: String(d.applicantsOpen || 0), icon: Users, to: "/hiring", tone: "text-violet-600 bg-violet-500/10" });
    c.push({ label: "My open tasks", value: String(d.myTasks?.length || 0), icon: CheckCircle2, to: "/company-tasks", tone: "text-emerald-600 bg-emerald-500/10" });
    return c.slice(0, 6);
  }, [focus, d]);

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Core · Dashboard</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{greeting}, {firstName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {focus.length ? `${focus.map((f) => FOCUS_LABEL[f]).join(" · ")} — today at Clovr Labs.` : "Here's what's happening today."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((k) => (
          <Link key={k.label} to={k.to as any} className="group rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-md">
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${k.tone}`}><k.icon className="h-4 w-4" /></div>
            <p className="mt-3 text-xs text-muted-foreground">{k.label}</p>
            <p className="mt-1 text-xl font-semibold">{k.value}</p>
            <ArrowUpRight className="mt-2 h-3.5 w-3.5 text-muted-foreground transition group-hover:text-primary" />
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Jobs by stage */}
          <section className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">Active jobs</h2></div>
              <Link to="/jobs" className="text-xs text-primary hover:underline">All jobs →</Link>
            </div>
            <div className="divide-y divide-border">
              {(d.activeJobs || []).length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No active jobs yet.</p>}
              {(d.activeJobs || []).slice(0, 6).map((j: any) => (
                <Link key={j.id} to="/jobs/$id" params={{ id: j.id }} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{j.job_number ? `${j.job_number} · ` : ""}{j.name}</p>
                    <p className="mt-0.5 text-xs capitalize text-muted-foreground">{(j.stage || "—").replace(/_/g, " ")} · {money(Number(j.contract_value || 0))}{j.target_end_date ? ` · due ${j.target_end_date}` : ""}</p>
                  </div>
                  <div className="w-28">
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Number(j.percent_complete || 0))}%` }} />
                    </div>
                    <p className="mt-1 text-right text-[10px] text-muted-foreground">{Number(j.percent_complete || 0)}%</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Missed activity */}
          <section className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Missed activity</h2>
                <span className="text-xs text-muted-foreground">last 24h</span>
              </div>
              <Link to="/channels" className="text-xs text-primary hover:underline">Open communication →</Link>
            </div>
            <div className="divide-y divide-border">
              {missed.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">All caught up. No new activity in the last 24 hours.</p>}
              {missed.map((m: any) => {
                const uid = m.author_id || m.sender_id;
                const p = profiles[uid];
                const mentioned = Array.isArray(m.mentions) && m.mentions.includes(me);
                return (
                  <Link
                    key={`${m._type}-${m.id}`}
                    to={m._type === "channel" ? "/channels" : "/dm"}
                    search={m._type === "dm" ? { user: m.sender_id } as any : undefined}
                    className="flex items-start gap-3 px-5 py-3 hover:bg-muted/40"
                  >
                    <div className="mt-0.5">
                      {m._type === "channel" ? <Hash className="h-4 w-4 text-muted-foreground" /> : <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <UserMention userId={uid} name={p?.full_name || p?.email || "Someone"} size="xs" />
                        <span className="text-muted-foreground">{m._type === "channel" ? "in a channel" : "sent you a DM"}</span>
                        {mentioned && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">@you</span>}
                        <span className="ml-auto text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-sm">{m.body}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* On site today */}
          {(has("field") || has("pm") || has("exec")) && (
            <section className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2"><HardHat className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">On site today</h2></div>
                <Link to="/crews" className="text-xs text-primary hover:underline">Dispatch →</Link>
              </div>
              <div className="divide-y divide-border">
                {(d.onSite || []).length === 0 && <p className="p-6 text-center text-xs text-muted-foreground">No crew assignments for today.</p>}
                {(d.onSite || []).map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                    {a.user_id
                      ? <UserMention userId={a.user_id} name={profiles[a.user_id]?.full_name || profiles[a.user_id]?.email || "Crew member"} size="xs" />
                      : <span className="text-muted-foreground">{a.con_crews?.name || "Crew"}</span>}
                    <span className="text-xs capitalize text-muted-foreground">{a.role || "crew"}</span>
                    <span className="ml-auto truncate text-xs text-muted-foreground">{a.con_jobs?.name || "—"}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" /><h2 className="text-sm font-semibold">Needs attention</h2>
            </div>
            <div className="divide-y divide-border">
              {(d.attention || []).length === 0 && <p className="p-5 text-center text-xs text-muted-foreground">Nothing overdue or expiring.</p>}
              {(d.attention || []).map((a: any, i: number) => (
                <Link key={i} to={a.to as any} className="block px-5 py-2.5 hover:bg-muted/40">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{a.kind}</p>
                  <p className="text-sm">{a.label}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">My tasks</h2></div>
              <Link to="/company-tasks" className="text-xs text-primary hover:underline">All →</Link>
            </div>
            <div className="divide-y divide-border">
              {(d.myTasks || []).length === 0 && <p className="p-5 text-center text-xs text-muted-foreground">No tasks assigned to you.</p>}
              {(d.myTasks || []).slice(0, 6).map((t: any) => (
                <Link key={t.id} to="/company-tasks" className="block px-5 py-2.5 hover:bg-muted/40">
                  <p className="text-sm">{t.title}</p>
                  <p className="mt-0.5 text-xs capitalize text-muted-foreground">{t.priority || "normal"}{t.due_date ? ` · due ${t.due_date}` : ""}</p>
                </Link>
              ))}
            </div>
          </section>

          {has("materials") && (
            <section className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">Deliveries this week</h2></div>
                <Link to="/deliveries" className="text-xs text-primary hover:underline">All →</Link>
              </div>
              <div className="divide-y divide-border">
                {(d.deliveries || []).length === 0 && <p className="p-5 text-center text-xs text-muted-foreground">Nothing scheduled.</p>}
                {(d.deliveries || []).slice(0, 6).map((x: any) => (
                  <div key={x.id} className="px-5 py-2.5">
                    <p className="text-sm">{x.material}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{x.supplier || "—"} · {x.expected_date}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">Today's meetings</h2></div>
              <Link to="/calendar" className="text-xs text-primary hover:underline">Calendar →</Link>
            </div>
            <div className="divide-y divide-border">
              {(d.meetings || []).length === 0 && <p className="p-5 text-center text-xs text-muted-foreground">Nothing scheduled today.</p>}
              {(d.meetings || []).map((m: any) => (
                <div key={m.id} className="px-5 py-3">
                  <p className="text-sm font-medium">{m.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{new Date(m.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {profiles[m.host_id]?.full_name || "—"}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">Notifications</h2></div>
              <Link to="/notifications" className="text-xs text-primary hover:underline">All →</Link>
            </div>
            <div className="divide-y divide-border">
              {(d.notifs || []).length === 0 && <p className="p-5 text-center text-xs text-muted-foreground">You're all caught up.</p>}
              {(d.notifs || []).map((n: any) => (
                <div key={n.id} className="px-5 py-3">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
                </div>
              ))}
            </div>
          </section>

          {(has("safety") || has("field")) && (
            <section className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">Punch & quality</h2></div>
                <Link to="/punch-list" className="text-xs text-primary hover:underline">Punch list →</Link>
              </div>
              <div className="px-5 py-4 text-sm text-muted-foreground">
                {(d.punch || []).length} open punch items · {(d.incidents || []).length} incidents this month
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
