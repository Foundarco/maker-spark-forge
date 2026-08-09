import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, HardHat, Calculator, Loader2, FileSignature } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RecordLayout, ProfileCard, ActivityRail, type ActivityEvent } from "@/components/hq/RecordLayout";
import { ContextThread } from "@/components/hq/ContextThread";
import { ClientPortalPanel, ClientMessagesPanel } from "@/components/hq/ClientPortalPanel";

type Row = Record<string, any>;
const TABS = ["Overview", "Jobs", "Estimates", "Messages", "Portal", "Thread"] as const;
type Tab = (typeof TABS)[number];

const money = (n: any) => `$${Number(n || 0).toLocaleString()}`;
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—");

function ClientDetail() {
  const { id } = useParams({ from: "/_hq/clients/$id" });
  const navigate = useNavigate();
  const [client, setClient] = useState<Row | null>(null);
  const [jobs, setJobs] = useState<Row[]>([]);
  const [estimates, setEstimates] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Overview");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [c, j, e] = await Promise.all([
        (supabase.from("con_clients") as any).select("*").eq("id", id).maybeSingle(),
        (supabase.from("con_jobs") as any).select("*").eq("client_id", id).order("created_at", { ascending: false }),
        (supabase.from("con_estimates") as any).select("*").eq("client_id", id).order("created_at", { ascending: false }),
      ]);
      if (!alive) return;
      setClient(c.data ?? null);
      setJobs(j.data ?? []);
      setEstimates(e.data ?? []);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [id]);

  const totals = useMemo(() => ({
    contract: jobs.reduce((s, j) => s + Number(j.contract_value || 0), 0),
    billed: jobs.reduce((s, j) => s + Number(j.billed || 0), 0),
    active: jobs.filter((j) => j.stage === "active").length,
    openBids: estimates.filter((e) => e.status !== "approved" && e.status !== "lost").length,
  }), [jobs, estimates]);

  const activity: ActivityEvent[] = useMemo(() => [
    ...jobs.slice(0, 6).map((j) => ({ id: `j${j.id}`, icon: HardHat, title: `${j.job_number ?? "Job"} — ${j.name}`, meta: `${j.stage} · ${money(j.contract_value)}`, timestamp: fmt(j.created_at), tone: "primary" as const })),
    ...estimates.slice(0, 6).map((e) => ({ id: `e${e.id}`, icon: Calculator, title: `${e.estimate_number ?? "Estimate"} — ${e.title}`, meta: `${e.status} · ${money(e.total)}`, timestamp: fmt(e.created_at), tone: "default" as const })),
  ], [jobs, estimates]);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!client) return (
    <div className="p-10 text-center">
      <p className="text-sm text-muted-foreground">Client not found.</p>
      <Link to="/clients" className="mt-3 inline-block text-sm text-primary hover:underline">Back to clients</Link>
    </div>
  );

  return (
    <RecordLayout
      scope="client"
      header={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/clients" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><ArrowLeft className="h-4 w-4" /></Link>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{client.client_type ?? "Client"}</p>
              <h1 className="text-base font-semibold leading-tight">{client.company || client.name}</h1>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{t}</button>
            ))}
          </nav>
        </div>
      }
      profile={
        <ProfileCard
          name={client.company || client.name}
          subtitle={client.company ? client.name : client.client_type}
          tags={[{ label: client.status ?? "prospect", tone: client.status === "active" ? "success" : "primary" }, { label: `${jobs.length} jobs`, tone: "muted" }]}
          email={client.email}
          phone={client.phone}
          onEmail={() => navigate({ to: "/mail" })}
          onMessage={() => setTab("Thread")}
          onSchedule={() => navigate({ to: "/calendar" })}
          fields={[
            { label: "Location", value: [client.city, client.state].filter(Boolean).join(", ") || "—" },
            { label: "Active jobs", value: totals.active },
            { label: "Contract value", value: money(totals.contract) },
            { label: "Billed", value: money(totals.billed) },
            { label: "Open bids", value: totals.openBids },
            { label: "Client since", value: fmt(client.created_at) },
          ]}
        />
      }
      activity={<ActivityRail title="Client history" events={activity} />}
    >
      {tab === "Thread" ? (
        <div className="h-full"><ContextThread entityType="client" entityId={client.id} title={`Client thread · ${client.company || client.name}`} /></div>
      ) : (
        <div className="space-y-6 p-5">
          {tab === "Overview" && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Kpi label="Jobs" value={jobs.length} />
                <Kpi label="Active" value={totals.active} />
                <Kpi label="Contract value" value={money(totals.contract)} />
                <Kpi label="Open bids" value={totals.openBids} />
              </div>
              <Panel title="Notes"><p className="whitespace-pre-wrap text-sm text-muted-foreground">{client.notes || "No notes recorded."}</p></Panel>
            </>
          )}

          {tab === "Jobs" && (
            <Panel title={`Jobs (${jobs.length})`}>
              {jobs.length === 0 ? <p className="text-xs text-muted-foreground">No jobs for this client yet.</p> : (
                <ul className="divide-y divide-border">
                  {jobs.map((j) => (
                    <li key={j.id} className="flex items-center justify-between py-2.5">
                      <Link to="/jobs/$id" params={{ id: j.id }} className="min-w-0">
                        <p className="truncate text-sm font-medium text-primary hover:underline">{j.job_number ? `${j.job_number} · ` : ""}{j.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{[j.city, j.state].filter(Boolean).join(", ")} · {j.stage}</p>
                      </Link>
                      <span className="font-mono text-xs">{money(j.contract_value)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}

          {tab === "Estimates" && (
            <Panel title={`Estimates (${estimates.length})`} action={<Link to="/estimates" className="text-xs text-primary hover:underline">Open module</Link>}>
              {estimates.length === 0 ? <p className="text-xs text-muted-foreground">No estimates yet.</p> : (
                <ul className="divide-y divide-border">
                  {estimates.map((e) => (
                    <li key={e.id} className="flex items-center justify-between py-2.5">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate text-sm font-medium"><FileSignature className="h-3.5 w-3.5 text-muted-foreground" />{e.estimate_number ? `${e.estimate_number} · ` : ""}{e.title}</p>
                        <p className="text-xs text-muted-foreground">{e.status} · valid to {fmt(e.valid_until)}</p>
                      </div>
                      <span className="font-mono text-xs">{money(e.total)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}
        </div>
      )}
    </RecordLayout>
  );
}

function Kpi({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
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

export const Route = createFileRoute("/_hq/clients/$id")({
  head: () => ({ meta: [{ title: "Client record — McGuire HQ" }, { name: "robots", content: "noindex" }] }),
  component: ClientDetail,
});
