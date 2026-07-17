import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileBarChart, TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_hq/financial-reports")({
  head: () => ({ meta: [{ title: "Financial Reports — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: FinancialReportsPage,
});

function fmt(n: number) { return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`; }

function FinancialReportsPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [inv, b, e, o, ac] = await Promise.all([
        (supabase.from("fin_invoices") as any).select("issue_date, total, subtotal, status"),
        (supabase.from("fin_bills") as any).select("issue_date, amount, status, category"),
        (supabase.from("fin_expenses") as any).select("spent_at, amount, category, status"),
        (supabase.from("sales_orders") as any).select("ordered_at, subtotal, total, status"),
        (supabase.from("fin_accounts") as any).select("name, type, balance"),
      ]);
      setInvoices((inv.data ?? []) as any[]);
      setBills((b.data ?? []) as any[]);
      setExpenses((e.data ?? []) as any[]);
      setOrders((o.data ?? []) as any[]);
      setAccounts((ac.data ?? []) as any[]);
      setLoading(false);
    })();
  }, []);

  const revenue = invoices.filter((r) => r.status === "paid" || r.status === "sent").reduce((s, r) => s + Number(r.subtotal || r.total || 0), 0)
    + orders.filter((r) => !["cancelled", "refunded"].includes(r.status)).reduce((s, r) => s + Number(r.subtotal || r.total || 0), 0);
  const cogs = bills.filter((r) => (r.category || "").toLowerCase().includes("cogs")).reduce((s, r) => s + Number(r.amount || 0), 0);
  const opex = bills.filter((r) => !(r.category || "").toLowerCase().includes("cogs")).reduce((s, r) => s + Number(r.amount || 0), 0)
    + expenses.filter((r) => r.status !== "rejected").reduce((s, r) => s + Number(r.amount || 0), 0);
  const grossProfit = revenue - cogs;
  const netIncome = grossProfit - opex;

  const now = new Date();
  const months: { label: string; key: string; rev: number; costs: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({ label: d.toLocaleDateString(undefined, { month: "short" }), key, rev: 0, costs: 0 });
  }
  const addTo = (bucket: "rev" | "costs", dateStr: string | null, amount: number) => {
    if (!dateStr) return;
    const key = dateStr.slice(0, 7);
    const m = months.find((x) => x.key === key);
    if (m) m[bucket] += amount;
  };
  for (const r of invoices) if (r.status === "paid" || r.status === "sent") addTo("rev", r.issue_date, Number(r.subtotal || r.total || 0));
  for (const r of orders) if (!["cancelled", "refunded"].includes(r.status)) addTo("rev", r.ordered_at, Number(r.subtotal || r.total || 0));
  for (const r of bills) addTo("costs", r.issue_date, Number(r.amount || 0));
  for (const r of expenses) if (r.status !== "rejected") addTo("costs", r.spent_at, Number(r.amount || 0));
  const maxMonth = Math.max(1, ...months.flatMap((m) => [m.rev, m.costs]));

  const assets = accounts.filter((a) => a.type === "asset").reduce((s, a) => s + Number(a.balance || 0), 0);
  const liabilities = accounts.filter((a) => a.type === "liability").reduce((s, a) => s + Number(a.balance || 0), 0);
  const equity = accounts.filter((a) => a.type === "equity").reduce((s, a) => s + Number(a.balance || 0), 0);

  if (loading) return <div className="p-12 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileBarChart className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Finance · Reports</p>
          <h1 className="text-3xl font-semibold tracking-tight">Financial Reports</h1>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="Revenue" value={fmt(revenue)} icon={TrendingUp} />
        <KPI label="COGS" value={fmt(cogs)} icon={TrendingDown} hint={`Gross ${fmt(grossProfit)}`} />
        <KPI label="Operating expenses" value={fmt(opex)} icon={TrendingDown} />
        <KPI label="Net income" value={fmt(netIncome)} icon={DollarSign} hint={netIncome >= 0 ? "profit" : "loss"} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">P&amp;L · trailing 6 months</p>
          <div className="mt-4 flex h-52 items-end gap-4">
            {months.map((m) => (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end gap-1">
                  <div className="flex-1 rounded-t bg-emerald-500/70" style={{ height: `${(m.rev / maxMonth) * 100}%` }} title={`Revenue ${fmt(m.rev)}`} />
                  <div className="flex-1 rounded-t bg-destructive/60" style={{ height: `${(m.costs / maxMonth) * 100}%` }} title={`Costs ${fmt(m.costs)}`} />
                </div>
                <div className="text-xs font-medium">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-500/70" /> Revenue</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-destructive/60" /> Costs</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Balance sheet snapshot</p>
          <dl className="mt-4 divide-y divide-border">
            <Row label="Assets" value={fmt(assets)} />
            <Row label="Liabilities" value={fmt(liabilities)} />
            <Row label="Equity" value={fmt(equity)} />
            <Row label="A − L" value={fmt(assets - liabilities)} strong />
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">Update account balances in Accounting to keep this in sync.</p>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, icon: Icon, hint }: { label: string; value: string; icon: typeof FileBarChart; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-2">
      <dt className={`text-sm ${strong ? "font-semibold" : "text-muted-foreground"}`}>{label}</dt>
      <dd className={`tabular-nums ${strong ? "font-semibold" : ""}`}>{value}</dd>
    </div>
  );
}
