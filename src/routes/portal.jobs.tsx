import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Panel, Empty } from "./portal.index";

type Row = Record<string, any>;
const money = (n: any) => `$${Math.round(Number(n || 0)).toLocaleString()}`;
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—");

function PortalJobs() {
  const { portal } = Route.useRouteContext();
  const [jobs, setJobs] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.from("con_jobs").select("*").eq("client_id", portal.clientId).order("created_at", { ascending: false });
      if (!alive) return;
      setJobs(data ?? []);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [portal.clientId]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">My projects</h1>
        <p className="mt-1 text-sm text-muted-foreground">Progress, schedule and scope for every project we're running for you.</p>
      </header>

      {jobs.length === 0 ? (
        <Panel title="Projects"><Empty text="No projects on file yet." /></Panel>
      ) : jobs.map((j) => (
        <Panel key={j.id} title={`${j.job_number ? j.job_number + " · " : ""}${j.name}`}>
          <div className="grid gap-4 sm:grid-cols-2">
            <dl className="space-y-2 text-sm">
              <Field label="Status" value={j.stage ?? "—"} />
              <Field label="Location" value={[j.address, j.city, j.state].filter(Boolean).join(", ") || "—"} />
              <Field label="Started" value={fmt(j.start_date)} />
              <Field label="Target completion" value={fmt(j.target_end_date)} />
              <Field label="Contract value" value={money(j.contract_value)} />
              <Field label="Billed to date" value={money(j.billed)} />
            </dl>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Progress</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Number(j.percent_complete || 0))}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{Number(j.percent_complete || 0)}% complete</p>
              {j.description && <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">{j.description}</p>}
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right text-xs font-medium capitalize">{value}</dd>
    </div>
  );
}

export const Route = createFileRoute("/portal/jobs")({
  head: () => ({ meta: [{ title: "My Projects — Client Portal" }, { name: "robots", content: "noindex" }] }),
  component: PortalJobs,
});
