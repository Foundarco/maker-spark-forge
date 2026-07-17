import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { History, Ticket, Wrench, Undo2, ShieldCheck, Smile, Search, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_hq/customer-timeline")({
  head: () => ({ meta: [{ title: "Customer Timeline — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: CustomerTimelinePage,
});

type Event = {
  kind: "ticket" | "repair" | "rma" | "warranty" | "csat";
  id: string;
  at: string;
  title: string;
  detail: string;
  status?: string | null;
};

const KIND_META: Record<Event["kind"], { icon: typeof Ticket; label: string; color: string }> = {
  ticket: { icon: Ticket, label: "Ticket", color: "text-blue-500 bg-blue-500/10" },
  repair: { icon: Wrench, label: "Repair", color: "text-amber-500 bg-amber-500/10" },
  rma: { icon: Undo2, label: "RMA", color: "text-purple-400 bg-purple-500/10" },
  warranty: { icon: ShieldCheck, label: "Warranty", color: "text-emerald-500 bg-emerald-500/10" },
  csat: { icon: Smile, label: "CSAT", color: "text-pink-400 bg-pink-500/10" },
};

function CustomerTimelinePage() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!debounced) { setEvents([]); return; }
    setLoading(true);
    (async () => {
      const like = `%${debounced}%`;
      const [tickets, repairs, rmas, warranty, csat] = await Promise.all([
        (supabase.from("cs_tickets") as any).select("id, subject, customer_name, customer_email, status, channel, created_at").or(`customer_name.ilike.${like},customer_email.ilike.${like}`).order("created_at", { ascending: false }).limit(50),
        (supabase.from("cs_repairs") as any).select("id, product_name, customer_name, customer_email, status, created_at").or(`customer_name.ilike.${like},customer_email.ilike.${like}`).order("created_at", { ascending: false }).limit(50),
        (supabase.from("cs_rmas") as any).select("id, product_name, customer_name, customer_email, status, created_at").or(`customer_name.ilike.${like},customer_email.ilike.${like}`).order("created_at", { ascending: false }).limit(50),
        (supabase.from("cs_warranty_claims") as any).select("id, product_name, customer_name, customer_email, status, created_at").or(`customer_name.ilike.${like},customer_email.ilike.${like}`).order("created_at", { ascending: false }).limit(50),
        (supabase.from("cs_csat_responses") as any).select("id, score, comment, customer_name, customer_email, created_at").or(`customer_name.ilike.${like},customer_email.ilike.${like}`).order("created_at", { ascending: false }).limit(50),
      ]);
      const all: Event[] = [
        ...((tickets.data ?? []) as any[]).map((r): Event => ({ kind: "ticket", id: r.id, at: r.created_at, title: r.subject, detail: `${r.channel} · ${r.customer_email || r.customer_name || ""}`, status: r.status })),
        ...((repairs.data ?? []) as any[]).map((r): Event => ({ kind: "repair", id: r.id, at: r.created_at, title: r.product_name, detail: r.customer_email || r.customer_name || "", status: r.status })),
        ...((rmas.data ?? []) as any[]).map((r): Event => ({ kind: "rma", id: r.id, at: r.created_at, title: r.product_name || "Return", detail: r.customer_email || r.customer_name || "", status: r.status })),
        ...((warranty.data ?? []) as any[]).map((r): Event => ({ kind: "warranty", id: r.id, at: r.created_at, title: r.product_name, detail: r.customer_email || r.customer_name || "", status: r.status })),
        ...((csat.data ?? []) as any[]).map((r): Event => ({ kind: "csat", id: r.id, at: r.created_at, title: `CSAT ${r.score}/5`, detail: r.comment || r.customer_email || r.customer_name || "" })),
      ];
      all.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
      setEvents(all);
      setLoading(false);
    })();
  }, [debounced]);

  const grouped = useMemo(() => {
    const g = new Map<string, Event[]>();
    for (const e of events) {
      const d = new Date(e.at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
      if (!g.has(d)) g.set(d, []);
      g.get(d)!.push(e);
    }
    return Array.from(g.entries());
  }, [events]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><History className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Customer Service · Timeline</p>
          <h1 className="text-3xl font-semibold tracking-tight">Customer Timeline</h1>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by customer name or email…"
          className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {!debounced ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Enter a name or email to pull every ticket, repair, return, warranty claim, and CSAT response for that customer.
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No interactions found for "{debounced}".
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([day, items]) => (
            <div key={day}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{day}</p>
              <ul className="space-y-2">
                {items.map((e) => {
                  const meta = KIND_META[e.kind];
                  const Icon = meta.icon;
                  return (
                    <li key={`${e.kind}-${e.id}`} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{meta.label}</span>
                          {e.status && <span className="text-[11px] rounded-full border border-border bg-muted/40 px-2 py-0.5 text-muted-foreground">{e.status.replace(/_/g, " ")}</span>}
                          <span className="ml-auto text-xs text-muted-foreground">{new Date(e.at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
                        </div>
                        <p className="mt-1 font-medium truncate">{e.title}</p>
                        {e.detail && <p className="mt-0.5 text-xs text-muted-foreground truncate">{e.detail}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
