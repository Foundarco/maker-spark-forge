import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HardHat, Loader2, FileSpreadsheet, GitPullRequestArrow, FolderOpen } from "lucide-react";

type Row = Record<string, any>;
const money = (n: any) => `$${Math.round(Number(n || 0)).toLocaleString()}`;
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—");

function PortalOverview() {
  const { portal } = Route.useRouteContext();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Row[]>([]);
  const [invoices, setInvoices] = useState<Row[]>([]);
  const [cos, setCos] = useState<Row[]>([]);
  const [docs, setDocs] = useState<Row[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: j } = await supabase.from("con_jobs").select("*").eq("client_id", portal.clientId).order("created_at", { ascending: false });
      const jobIds = (j ?? []).map((r: any) => r.id);
      const [inv, co, dc] = await Promise.all([
        supabase.from("fin_invoices").select("*").eq("client_id", portal.clientId).order("issue_date", { ascending: false }),
        jobIds.length ? supabase.from("con_change_orders").select("*").in("job_id", jobIds).order("created_at", { ascending: false }) : Promise.resolve({ data: [] } as any),
        jobIds.length ? supabase.from("con_documents").select("*").in("job_id", jobIds).order("created_at", { ascending: false }).limit(10) : Promise.resolve({ data: [] } as any),
      ]);
      if (!alive) return;
      setJobs(j ?? []); setInvoices(inv.data ?? []); setCos(co.data ?? []); setDocs(dc.data ?? []);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [portal.clientId]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const active = jobs.filter((j) => j.stage === "active" || j.status === "active");
  const outstanding = invoices.filter((i) => i.status !== "paid" && i.status !== "void");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everything happening on your projects with McGuire Construction.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={HardHat} label="Active projects" value={active.length} hint={`${jobs.length} total`} />
        <Kpi icon={FileSpreadsheet} label="Outstanding balance" value={money(outstanding.reduce((s, i) => s + Number(i.total || 0), 0))} hint={`${outstanding.length} open invoices`} />
        <Kpi icon={GitPullRequestArrow} label="Change orders" value={cos.length} hint={`${cos.filter((c) => c.status === "approved").length} approved`} />
        <Kpi icon={FolderOpen} label="Shared documents" value={docs.length} />
      </div>

      <Panel title="Your projects" action={<Link to="/portal/jobs" className="text-xs text-primary hover:underline">View all</Link>}>
        {jobs.length === 0 ? <Empty text="No projects on file yet." /> : (
          <ul className="divide-y divide-border">
            {jobs.slice(0, 5).map((j) => (
              <li key={j.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{j.job_number ? `${j.job_number} · ` : ""}{j.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{[j.city, j.state].filter(Boolean).join(", ")} · target {fmt(j.target_end_date)}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] capitalize">{j.stage ?? "—"}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Number(j.percent_complete || 0))}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Recent change orders">
        {cos.length === 0 ? <Empty text="No change orders." /> : (
          <ul className="divide-y divide-border">
            {cos.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="truncate">{c.co_number ? `${c.co_number} · ` : ""}{c.title}</span>
                <span className="shrink-0 font-mono text-xs">{money(c.cost_delta)} · {c.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

export function Kpi({ icon: Icon, label, value, hint }: { icon: any; label: string; value: any; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-xl font-semibold">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
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

export function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-xs text-muted-foreground">{text}</p>;
}

export const Route = createFileRoute("/portal/")({
  head: () => ({ meta: [{ title: "Client Portal — McGuire Construction" }, { name: "robots", content: "noindex" }] }),
  component: PortalOverview,
});
