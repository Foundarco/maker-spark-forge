import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_hq/taxes")({
  head: () => ({ meta: [{ title: "Taxes — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: TaxesPage,
});

function fmt(n: number) { return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

function TaxesPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [inv, b, o] = await Promise.all([
        (supabase.from("fin_invoices") as any).select("issue_date, tax, total, status"),
        (supabase.from("fin_bills") as any).select("issue_date, tax, amount, status"),
        (supabase.from("sales_orders") as any).select("ordered_at, tax, total, status"),
      ]);
      setInvoices((inv.data ?? []) as any[]);
      setBills((b.data ?? []) as any[]);
      setOrders((o.data ?? []) as any[]);
      setLoading(false);
    })();
  }, []);

  const currentYear = new Date().getFullYear();
  const quarters: { label: string; start: Date; end: Date }[] = [
    { label: "Q1", start: new Date(currentYear, 0, 1), end: new Date(currentYear, 3, 0) },
    { label: "Q2", start: new Date(currentYear, 3, 1), end: new Date(currentYear, 6, 0) },
    { label: "Q3", start: new Date(currentYear, 6, 1), end: new Date(currentYear, 9, 0) },
    { label: "Q4", start: new Date(currentYear, 9, 1), end: new Date(currentYear, 12, 0) },
  ];

  const sumTax = (rows: any[], dateKey: string, taxKey: string, start: Date, end: Date) =>
    rows.reduce((s, r) => {
      const d = r[dateKey] ? new Date(r[dateKey]) : null;
      if (!d || d < start || d > end) return s;
      return s + Number(r[taxKey] || 0);
    }, 0);

  const collectedTotal = invoices.reduce((s, r) => s + Number(r.tax || 0), 0)
    + orders.reduce((s, r) => s + Number(r.tax || 0), 0);
  const paidTotal = bills.reduce((s, r) => s + Number(r.tax || 0), 0);

  if (loading) return <div className="p-12 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Calculator className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Finance · Taxes</p>
          <h1 className="text-3xl font-semibold tracking-tight">Taxes · {currentYear}</h1>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card label="Tax collected (AR)" value={fmt(collectedTotal)} hint="Invoices + orders" />
        <Card label="Tax paid (AP)" value={fmt(paidTotal)} hint="Vendor bills" />
        <Card label="Net position" value={fmt(collectedTotal - paidTotal)} hint="Owed to authorities" />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Quarter</th>
              <th className="px-4 py-3 font-medium text-right">Collected (invoices)</th>
              <th className="px-4 py-3 font-medium text-right">Collected (orders)</th>
              <th className="px-4 py-3 font-medium text-right">Paid (bills)</th>
              <th className="px-4 py-3 font-medium text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {quarters.map((q) => {
              const invTax = sumTax(invoices, "issue_date", "tax", q.start, q.end);
              const ordTax = sumTax(orders, "ordered_at", "tax", q.start, q.end);
              const billTax = sumTax(bills, "issue_date", "tax", q.start, q.end);
              const net = invTax + ordTax - billTax;
              return (
                <tr key={q.label} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{q.label} {currentYear}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(invTax)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(ordTax)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(billTax)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">{fmt(net)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Figures pull directly from invoices, orders, and vendor bills. Add tax to those records to populate this dashboard.
      </p>
    </div>
  );
}

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
