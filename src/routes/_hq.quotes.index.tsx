import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calculator, Plus, Search, Loader2, FileEdit, Send, CheckCircle2, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UserMention } from "@/components/hq/UserMention";

type Row = Record<string, any>;

const STATUSES = ["draft", "sent", "approved", "won", "declined", "lost"] as const;

const STATUS_STYLE: Record<string, string> = {
  draft: "border-border bg-muted/50 text-muted-foreground",
  sent: "border-blue-200 bg-blue-50 text-blue-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  won: "border-emerald-200 bg-emerald-50 text-emerald-700",
  declined: "border-amber-200 bg-amber-50 text-amber-700",
  lost: "border-red-200 bg-red-50 text-red-700",
};

function money(n: any) {
  return `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
}

function QuotesDashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [clients, setClients] = useState<Row[]>([]);
  const [profiles, setProfiles] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const load = async () => {
    const [e, c, p] = await Promise.all([
      (supabase.from("con_estimates") as any).select("*").order("created_at", { ascending: false }),
      (supabase.from("con_clients") as any).select("id, name, company"),
      supabase.from("profiles").select("id, full_name, email"),
    ]);
    setRows((e.data ?? []) as Row[]);
    setClients((c.data ?? []) as Row[]);
    setProfiles((p.data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const kpis = useMemo(() => {
    const open = rows.filter((r) => !["won", "lost", "declined"].includes(r.status));
    const drafts = rows.filter((r) => r.status === "draft");
    const sent = rows.filter((r) => r.status === "sent");
    const won = rows.filter((r) => ["won", "approved"].includes(r.status));
    return [
      { label: "Open quotes", count: open.length, value: money(open.reduce((s, r) => s + Number(r.total || 0), 0)), icon: Layers, grad: "from-blue-500 to-indigo-600" },
      { label: "Drafts", count: drafts.length, value: money(drafts.reduce((s, r) => s + Number(r.total || 0), 0)), icon: FileEdit, grad: "from-violet-500 to-purple-600" },
      { label: "Sent / awaiting", count: sent.length, value: money(sent.reduce((s, r) => s + Number(r.total || 0), 0)), icon: Send, grad: "from-amber-500 to-orange-600" },
      { label: "Won", count: won.length, value: money(won.reduce((s, r) => s + Number(r.total || 0), 0)), icon: CheckCircle2, grad: "from-emerald-500 to-teal-600" },
    ];
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!needle) return true;
      return [r.title, r.estimate_number, r.scope, r.contact_name, r.contact_email]
        .filter(Boolean).some((v: string) => String(v).toLowerCase().includes(needle));
    });
  }, [rows, q, status]);

  const clientName = (id: string | null) => {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : "—";
  };

  const createQuote = async () => {
    setCreating(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const number = `Q-${new Date().getFullYear().toString().slice(2)}-${String(rows.length + 1).padStart(4, "0")}`;
      const { data, error } = await (supabase.from("con_estimates") as any)
        .insert({ estimate_number: number, title: "New quote", status: "draft", estimator_id: u.user?.id, created_by: u.user?.id })
        .select("id").single();
      if (error) { alert(error.message); return; }
      navigate({ to: "/quotes/$id", params: { id: data.id } });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] p-5 lg:p-7">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Sales &amp; Quoting</p>
          <h1 className="truncate text-xl font-semibold sm:text-2xl">Quotes</h1>
        </div>
        <button
          onClick={createQuote}
          disabled={creating}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          New quote
        </button>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-2xl bg-gradient-to-br ${k.grad} p-4 text-white shadow-sm`}>
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/80">{k.label}</p>
              <k.icon className="h-4 w-4 text-white/80" />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums">{k.count}</p>
            <p className="mt-0.5 text-sm text-white/85">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3 sm:flex sm:justify-between">
          <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search quotes…"
              aria-label="Search quotes"
              className="w-full min-w-0 bg-transparent text-sm outline-none sm:w-64"
            />
          </div>
          <div className="flex shrink-0 flex-wrap gap-1">
            {["all", ...STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-14 text-center text-sm text-muted-foreground">No quotes match this view.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Quote</th>
                  <th className="px-4 py-2.5 font-medium">Customer</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                  <th className="px-4 py-2.5 text-right font-medium">Margin</th>
                  <th className="px-4 py-2.5 font-medium">Owner</th>
                  <th className="px-4 py-2.5 font-medium">Valid until</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => {
                  const owner = profiles.find((p) => p.id === r.estimator_id);
                  const margin = Number(r.total || 0) - Number(r.cost_total || 0);
                  const pct = Number(r.total || 0) > 0 ? Math.round((margin / Number(r.total)) * 100) : 0;
                  return (
                    <tr key={r.id} className="hover:bg-muted/40">
                      <td className="px-4 py-2.5">
                        <Link to="/quotes/$id" params={{ id: r.id }} className="block">
                          <span className="font-medium text-primary hover:underline">{r.title}</span>
                          <span className="block font-mono text-[11px] text-muted-foreground">{r.estimate_number ?? "—"}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{clientName(r.client_id)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] capitalize ${STATUS_STYLE[r.status] ?? STATUS_STYLE.draft}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">{money(r.total)}</td>
                      <td className={`px-4 py-2.5 text-right font-mono ${margin < 0 ? "text-destructive" : ""}`}>{money(margin)} <span className="text-xs text-muted-foreground">({pct}%)</span></td>
                      <td className="px-4 py-2.5">
                        {owner ? <UserMention userId={owner.id} name={owner.full_name || owner.email || "User"} /> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{fmt(r.valid_until)}</td>
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

export const Route = createFileRoute("/_hq/quotes/")({
  head: () => ({ meta: [{ title: "Quotes — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: QuotesDashboard,
});
