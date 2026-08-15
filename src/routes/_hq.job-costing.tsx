import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Coins, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Job = Record<string, any>;

const money = (n: any) => `$${Number(n || 0).toLocaleString()}`;

function JobCosting() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from("con_jobs") as any)
        .select("id, job_number, name, stage, contract_value, estimated_cost, actual_cost, billed, percent_complete")
        .order("created_at", { ascending: false });
      setJobs(data ?? []);
      setLoading(false);
    })();
  }, []);

  const contract = jobs.reduce((s, j) => s + Number(j.contract_value || 0), 0);
  const cost = jobs.reduce((s, j) => s + Number(j.actual_cost || 0), 0);
  const billed = jobs.reduce((s, j) => s + Number(j.billed || 0), 0);
  const margin = contract - cost;

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Finance</p>
        <h1 className="text-xl font-semibold">Job Costing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Contract vs. cost vs. billing across every active job.</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Contract value" value={money(contract)} icon={Coins} />
        <Kpi label="Cost to date" value={money(cost)} icon={TrendingDown} />
        <Kpi label="Billed to date" value={money(billed)} icon={TrendingUp} />
        <Kpi label="Gross margin" value={money(margin)} icon={Coins} hint={contract ? `${Math.round((margin / contract) * 100)}% of contract` : undefined} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No jobs yet. <Link to="/jobs" className="text-primary hover:underline">Create one</Link>.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Job</th>
                  <th className="px-4 py-3 font-medium">Stage</th>
                  <th className="px-4 py-3 font-medium">Contract</th>
                  <th className="px-4 py-3 font-medium">Est. cost</th>
                  <th className="px-4 py-3 font-medium">Actual cost</th>
                  <th className="px-4 py-3 font-medium">Cost variance</th>
                  <th className="px-4 py-3 font-medium">Billed</th>
                  <th className="px-4 py-3 font-medium">Margin</th>
                  <th className="px-4 py-3 font-medium">% complete</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => {
                  const variance = Number(j.estimated_cost || 0) - Number(j.actual_cost || 0);
                  const m = Number(j.contract_value || 0) - Number(j.actual_cost || 0);
                  return (
                    <tr key={j.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <Link to="/jobs/$id" params={{ id: j.id }} className="font-medium text-primary hover:underline">
                          {j.job_number ? `${j.job_number} · ` : ""}{j.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{j.stage}</td>
                      <td className="px-4 py-3 font-mono text-xs">{money(j.contract_value)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{money(j.estimated_cost)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{money(j.actual_cost)}</td>
                      <td className={`px-4 py-3 font-mono text-xs ${variance < 0 ? "text-destructive" : "text-emerald-600"}`}>{money(variance)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{money(j.billed)}</td>
                      <td className={`px-4 py-3 font-mono text-xs font-medium ${m < 0 ? "text-destructive" : "text-emerald-600"}`}>{money(m)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Number(j.percent_complete || 0))}%` }} />
                          </div>
                          <span className="font-mono text-[11px]">{Number(j.percent_complete || 0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, hint }: { label: string; value: string; icon: any; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export const Route = createFileRoute("/_hq/job-costing")({
  head: () => ({ meta: [{ title: "Job Costing — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: JobCosting,
});
