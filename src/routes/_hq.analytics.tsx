import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, Loader2, HardHat, Coins, ShieldAlert, Users, Calculator, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Row = Record<string, any>;
const money = (n: any) => `$${Math.round(Number(n || 0)).toLocaleString()}`;

function Dashboards() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Row[]>([]);
  const [estimates, setEstimates] = useState<Row[]>([]);
  const [invoices, setInvoices] = useState<Row[]>([]);
  const [expenses, setExpenses] = useState<Row[]>([]);
  const [incidents, setIncidents] = useState<Row[]>([]);
  const [leads, setLeads] = useState<Row[]>([]);
  const [employees, setEmployees] = useState<Row[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const t = (name: string, cols = "*") => (supabase.from(name as never) as any).select(cols).limit(1000);
      const [j, e, i, x, s, l, emp] = await Promise.all([
        t("con_jobs"), t("con_estimates"), t("fin_invoices"), t("fin_expenses"),
        t("con_safety_incidents"), t("con_leads"), t("hr_employees"),
      ]);
      if (!alive) return;
      setJobs(j.data ?? []); setEstimates(e.data ?? []); setInvoices(i.data ?? []);
      setExpenses(x.data ?? []); setIncidents(s.data ?? []); setLeads(l.data ?? []);
      setEmployees(emp.data ?? []);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const active = jobs.filter((j) => j.stage === "active" || j.status === "active");
  const contract = jobs.reduce((s, j) => s + Number(j.contract_value || 0), 0);
  const actualCost = jobs.reduce((s, j) => s + Number(j.actual_cost || 0), 0);
  const billed = jobs.reduce((s, j) => s + Number(j.billed || 0), 0);
  const margin = contract > 0 ? Math.round(((contract - actualCost) / contract) * 100) : 0;
  const outstanding = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + Number(i.total || 0), 0);
  const openLeads = leads.filter((l) => !["won", "lost"].includes(l.stage));

  const byStage = group(jobs, (j) => j.stage || "unset");
  const byDivision = group(jobs, (j) => j.division || j.job_type || "Unassigned");
  const expenseByCategory = sumBy(expenses, (e) => e.category || "Uncategorized", (e) => Number(e.amount || 0));
  const revenueByMonth = sumBy(invoices, (i) => monthKey(i.issue_date || i.created_at), (i) => Number(i.total || 0));

  return (
    <div className="space-y-6 p-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Operations</p>
        <h1 className="flex items-center gap-2 text-xl font-semibold"><BarChart3 className="h-5 w-5 text-primary" /> Dashboards</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live rollup across jobs, finance, safety and people.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={HardHat} label="Active jobs" value={active.length} hint={`${jobs.length} total`} />
        <Kpi icon={Coins} label="Contract value" value={money(contract)} hint={`${money(billed)} billed`} />
        <Kpi icon={Receipt} label="Outstanding AR" value={money(outstanding)} hint={`${invoices.filter((i) => i.status !== "paid").length} open invoices`} />
        <Kpi icon={Calculator} label="Gross margin" value={`${margin}%`} hint={`${money(actualCost)} cost to date`} />
        <Kpi icon={Users} label="Headcount" value={employees.filter((e) => e.status !== "terminated").length} hint={`${employees.filter((e) => e.status === "onboarding").length} onboarding`} />
        <Kpi icon={ShieldAlert} label="Safety incidents" value={incidents.length} hint={`${incidents.filter((i) => i.osha_reportable).length} OSHA reportable`} />
        <Kpi icon={BarChart3} label="Open bids" value={openLeads.length} hint={money(openLeads.reduce((s, l) => s + Number(l.estimated_value || 0), 0))} />
        <Kpi icon={Calculator} label="Estimates" value={estimates.length} hint={`${estimates.filter((e) => e.status === "approved").length} approved`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Jobs by stage"><Bars data={byStage} /></Panel>
        <Panel title="Jobs by division"><Bars data={byDivision} /></Panel>
        <Panel title="Revenue invoiced by month"><Bars data={revenueByMonth} format={money} /></Panel>
        <Panel title="Expenses by category"><Bars data={expenseByCategory} format={money} /></Panel>
      </div>

      <Panel title="Job cost performance">
        {jobs.length === 0 ? <Empty /> : (
          <ul className="divide-y divide-border">
            {jobs.slice(0, 12).map((j) => {
              const pct = Number(j.percent_complete || 0);
              const cv = Number(j.contract_value || 0);
              const ac = Number(j.actual_cost || 0);
              const over = cv > 0 && ac > cv;
              return (
                <li key={j.id} className="py-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{j.job_number ? `${j.job_number} · ` : ""}{j.name}</span>
                    <span className={`font-mono text-xs ${over ? "text-red-600" : "text-muted-foreground"}`}>{money(ac)} / {money(cv)}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{pct}% complete · {j.stage ?? "—"}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function monthKey(d: string | null) {
  if (!d) return "Unknown";
  const dt = new Date(d);
  return dt.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

function group(rows: Row[], key: (r: Row) => string) {
  return sumBy(rows, key, () => 1);
}

function sumBy(rows: Row[], key: (r: Row) => string, value: (r: Row) => number) {
  const map = new Map<string, number>();
  for (const r of rows) map.set(key(r), (map.get(key(r)) ?? 0) + value(r));
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
}

function Bars({ data, format }: { data: [string, number][]; format?: (n: number) => string }) {
  if (data.length === 0) return <Empty />;
  const max = Math.max(...data.map((d) => d[1])) || 1;
  return (
    <ul className="space-y-2.5">
      {data.map(([label, value]) => (
        <li key={label}>
          <div className="flex items-center justify-between text-xs">
            <span className="truncate capitalize text-muted-foreground">{label.replace(/_/g, " ")}</span>
            <span className="font-mono font-medium">{format ? format(value) : value}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary/80" style={{ width: `${(value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Empty() {
  return <p className="py-4 text-center text-xs text-muted-foreground">No data yet.</p>;
}

function Kpi({ icon: Icon, label, value, hint }: { icon: any; label: string; value: any; hint?: string }) {
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-2.5">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export const Route = createFileRoute("/_hq/analytics")({
  head: () => ({ meta: [{ title: "Dashboards — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: Dashboards,
});
