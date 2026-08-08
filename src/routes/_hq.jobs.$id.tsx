import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ClipboardList, ListChecks, GitPullRequestArrow, MessageSquareWarning,
  ShieldAlert, Stamp, Loader2, Coins, CheckSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RecordLayout, ProfileCard, ActivityRail, type ActivityEvent } from "@/components/hq/RecordLayout";
import { ContextThread } from "@/components/hq/ContextThread";
import { UserMention } from "@/components/hq/UserMention";

type Row = Record<string, any>;

const TABS = ["Overview", "Daily Logs", "Tasks", "RFIs", "Change Orders", "Punch List", "Thread"] as const;
type Tab = (typeof TABS)[number];

function money(n: any) {
  return `$${Number(n || 0).toLocaleString()}`;
}
function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
}

function JobDetail() {
  const { id } = useParams({ from: "/_hq/jobs/$id" });
  const [job, setJob] = useState<Row | null>(null);
  const [client, setClient] = useState<Row | null>(null);
  const [profiles, setProfiles] = useState<Row[]>([]);
  const [logs, setLogs] = useState<Row[]>([]);
  const [tasks, setTasks] = useState<Row[]>([]);
  const [rfis, setRfis] = useState<Row[]>([]);
  const [cos, setCos] = useState<Row[]>([]);
  const [punch, setPunch] = useState<Row[]>([]);
  const [permits, setPermits] = useState<Row[]>([]);
  const [incidents, setIncidents] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Overview");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const t = (name: string) => (supabase.from(name as any) as any).select("*").eq("job_id", id);
      const [j, p, dl, tk, rf, co, pu, pm, si] = await Promise.all([
        (supabase.from("con_jobs") as any).select("*").eq("id", id).maybeSingle(),
        supabase.from("profiles").select("id, full_name, email"),
        t("con_daily_logs").order("log_date", { ascending: false }),
        t("con_tasks").order("created_at", { ascending: false }),
        t("con_submittals").order("created_at", { ascending: false }),
        t("con_change_orders").order("created_at", { ascending: false }),
        t("con_punch_items").order("created_at", { ascending: false }),
        t("con_permits").order("created_at", { ascending: false }),
        t("con_safety_incidents").order("incident_date", { ascending: false }),
      ]);
      if (!alive) return;
      setJob(j.data ?? null);
      setProfiles((p.data ?? []) as Row[]);
      setLogs(dl.data ?? []); setTasks(tk.data ?? []); setRfis(rf.data ?? []);
      setCos(co.data ?? []); setPunch(pu.data ?? []); setPermits(pm.data ?? []); setIncidents(si.data ?? []);
      if (j.data?.client_id) {
        const { data: cl } = await (supabase.from("con_clients") as any).select("*").eq("id", j.data.client_id).maybeSingle();
        if (alive) setClient(cl ?? null);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [id]);

  const nameOf = (uid: string | null) => {
    if (!uid) return null;
    const p = profiles.find((x) => x.id === uid);
    return p ? <UserMention userId={uid} name={p.full_name || p.email || "User"} /> : null;
  };

  const activity: ActivityEvent[] = useMemo(() => {
    const events: ActivityEvent[] = [];
    for (const l of logs.slice(0, 6)) events.push({ id: `l${l.id}`, icon: ClipboardList, title: `Daily log — ${l.crew_count ?? 0} crew, ${Number(l.hours_worked || 0)} hrs`, meta: l.work_performed?.slice(0, 80), timestamp: fmt(l.log_date), tone: "default" });
    for (const c of cos.slice(0, 4)) events.push({ id: `c${c.id}`, icon: GitPullRequestArrow, title: `${c.co_number ?? "CO"} — ${c.title}`, meta: `${money(c.cost_delta)} · ${c.status}`, timestamp: fmt(c.created_at), tone: c.status === "approved" ? "success" : "primary" });
    for (const s of incidents.slice(0, 3)) events.push({ id: `s${s.id}`, icon: ShieldAlert, title: `Safety: ${s.incident_type}`, meta: s.severity, timestamp: fmt(s.incident_date), tone: "warn" });
    for (const p of permits.slice(0, 3)) events.push({ id: `p${p.id}`, icon: Stamp, title: `Permit ${p.permit_type}`, meta: p.status, timestamp: fmt(p.issued_date ?? p.applied_date), tone: "default" });
    return events.slice(0, 14);
  }, [logs, cos, incidents, permits]);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!job) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-muted-foreground">Job not found.</p>
        <Link to="/jobs" className="mt-3 inline-block text-sm text-primary hover:underline">Back to jobs</Link>
      </div>
    );
  }

  const margin = Number(job.contract_value || 0) - Number(job.actual_cost || 0);

  return (
    <RecordLayout
      scope="job"
      header={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/jobs" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><ArrowLeft className="h-4 w-4" /></Link>
            <div>
              <p className="font-mono text-[11px] text-muted-foreground">{job.job_number ?? "—"}</p>
              <h1 className="text-base font-semibold leading-tight">{job.name}</h1>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>
      }
      profile={
        <ProfileCard
          name={job.name}
          subtitle={[job.job_type, job.division].filter(Boolean).join(" · ")}
          tags={[
            { label: job.stage ?? "stage", tone: job.stage === "active" ? "success" : "primary" },
            { label: `${Number(job.percent_complete || 0)}% complete`, tone: "muted" },
          ]}
          email={client?.email}
          phone={client?.phone}
          fields={[
            { label: "Client", value: client ? <Link to="/clients/$id" params={{ id: client.id }} className="text-primary hover:underline">{client.company || client.name}</Link> : "—" },
            { label: "Address", value: [job.address, job.city, job.state].filter(Boolean).join(", ") || "—" },
            { label: "PM", value: nameOf(job.project_manager_id) ?? "—" },
            { label: "Super", value: nameOf(job.superintendent_id) ?? "—" },
            { label: "Contract", value: money(job.contract_value) },
            { label: "Cost to date", value: money(job.actual_cost) },
            { label: "Billed", value: money(job.billed) },
            { label: "Margin", value: <span className={margin < 0 ? "text-destructive" : "text-emerald-600"}>{money(margin)}</span> },
            { label: "Start", value: fmt(job.start_date) },
            { label: "Target", value: fmt(job.target_end_date) },
          ]}
        />
      }
      activity={<ActivityRail title="Job activity" events={activity} />}
    >
      {tab === "Thread" ? (
        <div className="h-full"><ContextThread entityType="job" entityId={job.id} title={`Job thread · ${job.job_number ?? job.name}`} /></div>
      ) : (
        <div className="space-y-6 p-5">
          {tab === "Overview" && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Kpi icon={Coins} label="Contract" value={money(job.contract_value)} />
                <Kpi icon={Coins} label="Cost to date" value={money(job.actual_cost)} />
                <Kpi icon={CheckSquare} label="Open tasks" value={tasks.filter((t) => t.status !== "done").length} />
                <Kpi icon={ListChecks} label="Open punch" value={punch.filter((p) => p.status !== "closed" && p.status !== "verified").length} />
              </div>
              <Panel title="Scope">
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{job.description || "No scope summary recorded."}</p>
              </Panel>
              <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Permits">
                  <MiniList rows={permits} empty="No permits on file." render={(p) => <Row2 left={p.permit_type} right={p.status} sub={p.authority} />} />
                </Panel>
                <Panel title="Safety incidents">
                  <MiniList rows={incidents} empty="No incidents. Keep it that way." render={(s) => <Row2 left={s.incident_type} right={s.severity} sub={fmt(s.incident_date)} />} />
                </Panel>
              </div>
            </>
          )}

          {tab === "Daily Logs" && (
            <Panel title={`Daily logs (${logs.length})`} action={<Link to="/daily-logs" className="text-xs text-primary hover:underline">Open module</Link>}>
              <MiniList rows={logs} empty="No daily logs yet." render={(l) => (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{fmt(l.log_date)}</span>
                    <span className="text-xs text-muted-foreground">{l.crew_count ?? 0} crew · {Number(l.hours_worked || 0)} hrs · {l.weather ?? "—"}</span>
                  </div>
                  {l.work_performed && <p className="mt-1 text-xs text-muted-foreground">{l.work_performed}</p>}
                  {l.delays && <p className="mt-1 text-xs text-destructive">Delay: {l.delays}</p>}
                </div>
              )} />
            </Panel>
          )}

          {tab === "Tasks" && (
            <Panel title={`Tasks (${tasks.length})`} action={<Link to="/company-tasks" className="text-xs text-primary hover:underline">Open module</Link>}>
              <MiniList rows={tasks} empty="No tasks on this job." render={(t) => <Row2 left={t.title} right={t.status} sub={`${t.priority ?? "medium"} · due ${fmt(t.due_date)}`} />} />
            </Panel>
          )}

          {tab === "RFIs" && (
            <Panel title={`RFIs & submittals (${rfis.length})`} action={<Link to="/rfis" className="text-xs text-primary hover:underline">Open module</Link>}>
              <MiniList rows={rfis} empty="No RFIs logged." render={(r) => <Row2 left={`${r.number ?? ""} ${r.title}`.trim()} right={r.status} sub={`${r.kind ?? "rfi"} · due ${fmt(r.due_date)}`} icon={MessageSquareWarning} />} />
            </Panel>
          )}

          {tab === "Change Orders" && (
            <Panel title={`Change orders (${cos.length})`} action={<Link to="/change-orders" className="text-xs text-primary hover:underline">Open module</Link>}>
              <MiniList rows={cos} empty="No change orders." render={(c) => <Row2 left={`${c.co_number ?? "CO"} — ${c.title}`} right={c.status} sub={`${money(c.cost_delta)} · ${c.days_delta ?? 0} days`} />} />
            </Panel>
          )}

          {tab === "Punch List" && (
            <Panel title={`Punch list (${punch.length})`} action={<Link to="/punch-list" className="text-xs text-primary hover:underline">Open module</Link>}>
              <MiniList rows={punch} empty="Punch list is clear." render={(p) => <Row2 left={p.title} right={p.status} sub={[p.location, p.trade].filter(Boolean).join(" · ")} />} />
            </Panel>
          )}
        </div>
      )}
    </RecordLayout>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function MiniList({ rows, empty, render }: { rows: Row[]; empty: string; render: (r: Row) => React.ReactNode }) {
  if (rows.length === 0) return <p className="text-xs text-muted-foreground">{empty}</p>;
  return <ul className="divide-y divide-border">{rows.map((r) => <li key={r.id} className="py-2.5 first:pt-0 last:pb-0">{render(r)}</li>)}</ul>;
}

function Row2({ left, right, sub, icon: Icon }: { left: string; right?: string; sub?: string; icon?: any }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate text-sm font-medium">{Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}{left}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
      {right && <span className="flex-shrink-0 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">{right.replace(/_/g, " ")}</span>}
    </div>
  );
}

export const Route = createFileRoute("/_hq/jobs/$id")({
  head: () => ({ meta: [{ title: "Job record — McGuire HQ" }, { name: "robots", content: "noindex" }] }),
  component: JobDetail,
});
