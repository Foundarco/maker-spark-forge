import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Panel, Empty, Kpi } from "./portal.index";
import { FileSpreadsheet, Clock, CheckCircle2 } from "lucide-react";

type Row = Record<string, any>;
const money = (n: any) => `$${Math.round(Number(n || 0)).toLocaleString()}`;
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—");

function PortalInvoices() {
  const { portal } = Route.useRouteContext();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.from("fin_invoices").select("*").eq("client_id", portal.clientId).order("issue_date", { ascending: false });
      if (!alive) return;
      setRows(data ?? []);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [portal.clientId]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const open = rows.filter((r) => r.status !== "paid" && r.status !== "void");
  const paid = rows.filter((r) => r.status === "paid");
  const overdue = open.filter((r) => r.due_date && new Date(r.due_date) < new Date());

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Invoices</h1>
        <p className="mt-1 text-sm text-muted-foreground">Billing history and current balance on your account.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi icon={Clock} label="Outstanding" value={money(open.reduce((s, r) => s + Number(r.total || 0), 0))} hint={`${open.length} invoices`} />
        <Kpi icon={CheckCircle2} label="Paid to date" value={money(paid.reduce((s, r) => s + Number(r.total || 0), 0))} hint={`${paid.length} invoices`} />
        <Kpi icon={FileSpreadsheet} label="Overdue" value={overdue.length} />
      </div>

      <Panel title="All invoices">
        {rows.length === 0 ? <Empty text="No invoices yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Invoice</th>
                  <th className="py-2 pr-3 font-medium">Issued</th>
                  <th className="py-2 pr-3 font-medium">Due</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-3 font-mono text-xs">{r.invoice_number ?? r.id.slice(0, 8)}</td>
                    <td className="py-2.5 pr-3 text-xs">{fmt(r.issue_date)}</td>
                    <td className="py-2.5 pr-3 text-xs">{fmt(r.due_date)}</td>
                    <td className="py-2.5 pr-3"><span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] capitalize">{r.status ?? "—"}</span></td>
                    <td className="py-2.5 text-right font-mono text-xs font-medium">{money(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

export const Route = createFileRoute("/portal/invoices")({
  head: () => ({ meta: [{ title: "Invoices — Client Portal" }, { name: "robots", content: "noindex" }] }),
  component: PortalInvoices,
});
