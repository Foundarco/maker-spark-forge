import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, DollarSign, TrendingUp, Target, Filter, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_hq/sales-analytics")({
  head: () => ({ meta: [{ title: "Sales Analytics — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: SalesAnalyticsPage,
});

function fmt(n: number) { return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`; }

function SalesAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [d, o] = await Promise.all([
        (supabase.from("sales_deals") as any).select("*"),
        (supabase.from("sales_orders") as any).select("*"),
      ]);
      setDeals((d.data ?? []) as any[]);
      setOrders((o.data ?? []) as any[]);
      setLoading(false);
    })();
  }, []);

  const openDeals = deals.filter((d) => !["won", "lost"].includes(d.stage));
  const pipelineValue = openDeals.reduce((s, d) => s + Number(d.value || 0), 0);
  const weightedPipeline = openDeals.reduce((s, d) => s + Number(d.value || 0) * (Number(d.probability || 0) / 100), 0);
  const won = deals.filter((d) => d.stage === "won");
  const wonValue = won.reduce((s, d) => s + Number(d.value || 0), 0);
  const lost = deals.filter((d) => d.stage === "lost");
  const winRate = won.length + lost.length > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;

  const revenue = orders.filter((o) => !["cancelled", "refunded"].includes(o.status)).reduce((s, o) => s + Number(o.total || 0), 0);
  const aov = orders.length ? revenue / orders.length : 0;

  const byStage: Record<string, { count: number; value: number }> = {};
  for (const d of deals) {
    const s = d.stage || "lead";
    byStage[s] = byStage[s] || { count: 0, value: 0 };
    byStage[s].count += 1;
    byStage[s].value += Number(d.value || 0);
  }
  const STAGE_ORDER = ["lead", "qualified", "proposal", "negotiation", "won", "lost"];
  const maxStageValue = Math.max(1, ...Object.values(byStage).map((s) => s.value));

  // Monthly revenue trailing 6 months
  const now = new Date();
  const months: { label: string; key: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({ label: d.toLocaleDateString(undefined, { month: "short" }), key, revenue: 0 });
  }
  for (const o of orders) {
    if (!o.ordered_at) continue;
    if (["cancelled", "refunded"].includes(o.status)) continue;
    const key = o.ordered_at.slice(0, 7);
    const m = months.find((x) => x.key === key);
    if (m) m.revenue += Number(o.total || 0);
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.revenue));

  if (loading) return <div className="p-12 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><LineChart className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sales · Analytics</p>
          <h1 className="text-3xl font-semibold tracking-tight">Sales Analytics</h1>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="Pipeline value" value={fmt(pipelineValue)} icon={Filter} hint={`${openDeals.length} open`} />
        <KPI label="Weighted pipeline" value={fmt(weightedPipeline)} icon={Target} hint="× probability" />
        <KPI label="Won revenue" value={fmt(wonValue)} icon={TrendingUp} hint={`${winRate}% win rate`} />
        <KPI label="Order revenue" value={fmt(revenue)} icon={DollarSign} hint={`AOV ${fmt(aov)}`} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pipeline by stage</p>
          <div className="mt-4 space-y-3">
            {STAGE_ORDER.map((s) => {
              const stat = byStage[s] || { count: 0, value: 0 };
              const pct = (stat.value / maxStageValue) * 100;
              return (
                <div key={s}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="capitalize">{s}</span>
                    <span className="tabular-nums text-muted-foreground">{stat.count} · {fmt(stat.value)}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Monthly revenue (last 6)</p>
          <div className="mt-4 flex h-48 items-end gap-3">
            {months.map((m) => {
              const h = (m.revenue / maxMonth) * 100;
              return (
                <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                  <div className="text-xs tabular-nums text-muted-foreground">{fmt(m.revenue)}</div>
                  <div className="w-full flex-1 flex items-end">
                    <div className="w-full rounded-t bg-primary/80" style={{ height: `${Math.max(2, h)}%` }} />
                  </div>
                  <div className="text-xs font-medium">{m.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, icon: Icon, hint }: { label: string; value: string; icon: typeof LineChart; hint?: string }) {
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
