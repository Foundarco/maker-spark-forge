import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Hit = { id: string; title: string; subtitle: string; group: string; to?: string; params?: any };

type Source = {
  table: string;
  group: string;
  cols: string[];
  title: (r: any) => string;
  subtitle: (r: any) => string;
  link?: (r: any) => { to: string; params?: any };
};

const SOURCES: Source[] = [
  { table: "con_clients", group: "Clients", cols: ["name", "company", "email", "city"], title: (r) => r.company || r.name, subtitle: (r) => [r.name, r.email, r.city].filter(Boolean).join(" · "), link: (r) => ({ to: "/clients/$id", params: { id: r.id } }) },
  { table: "con_jobs", group: "Jobs", cols: ["name", "job_number", "address", "city", "description"], title: (r) => `${r.job_number ? r.job_number + " · " : ""}${r.name}`, subtitle: (r) => [r.stage, r.city, r.state].filter(Boolean).join(" · "), link: (r) => ({ to: "/jobs/$id", params: { id: r.id } }) },
  { table: "con_leads", group: "Leads", cols: ["title", "lead_number", "contact_name", "location"], title: (r) => r.title, subtitle: (r) => [r.stage, r.location].filter(Boolean).join(" · "), link: () => ({ to: "/leads" }) },
  { table: "con_estimates", group: "Estimates", cols: ["title", "estimate_number", "scope"], title: (r) => `${r.estimate_number ? r.estimate_number + " · " : ""}${r.title}`, subtitle: (r) => `${r.status ?? ""} · $${Number(r.total || 0).toLocaleString()}`, link: () => ({ to: "/quotes" }) },
  { table: "con_tasks", group: "Tasks", cols: ["title", "description"], title: (r) => r.title, subtitle: (r) => [r.status, r.priority, r.department].filter(Boolean).join(" · "), link: () => ({ to: "/company-tasks" }) },
  { table: "con_subcontractors", group: "Subcontractors", cols: ["name", "trade", "contact_name", "email"], title: (r) => r.name, subtitle: (r) => [r.trade, r.contact_name].filter(Boolean).join(" · "), link: () => ({ to: "/subcontractors" }) },
  { table: "con_equipment", group: "Equipment", cols: ["name", "asset_tag", "make", "model"], title: (r) => r.name, subtitle: (r) => [r.make, r.model, r.status].filter(Boolean).join(" · "), link: () => ({ to: "/equipment" }) },
  { table: "profiles", group: "People", cols: ["full_name", "email", "department", "title"], title: (r) => r.full_name || r.email, subtitle: (r) => [r.title, r.department].filter(Boolean).join(" · "), link: () => ({ to: "/employees" }) },
  { table: "fin_invoices", group: "Invoices", cols: ["invoice_number", "customer_name", "notes"], title: (r) => `${r.invoice_number ?? "Invoice"} · ${r.customer_name ?? ""}`, subtitle: (r) => `${r.status ?? ""} · $${Number(r.total || 0).toLocaleString()}`, link: () => ({ to: "/invoices" }) },
  { table: "con_documents", group: "Documents", cols: ["title", "doc_type", "notes"], title: (r) => r.title, subtitle: (r) => [r.doc_type, r.version].filter(Boolean).join(" · "), link: () => ({ to: "/plans" }) },
];

function UniversalSearch() {
  const search = useSearch({ from: "/_hq/search" }) as { q?: string };
  const navigate = useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  useEffect(() => { setQ(search.q ?? ""); }, [search.q]);

  useEffect(() => {
    const term = (search.q ?? "").trim();
    if (term.length < 2) { setHits([]); setRan(false); return; }
    let alive = true;
    setLoading(true);
    (async () => {
      const results = await Promise.all(
        SOURCES.map(async (s) => {
          const filter = s.cols.map((c) => `${c}.ilike.%${term}%`).join(",");
          const { data } = await (supabase.from(s.table as never) as any).select("*").or(filter).limit(8);
          return ((data ?? []) as any[]).map<Hit>((r) => ({
            id: `${s.table}-${r.id}`,
            title: s.title(r) || "Untitled",
            subtitle: s.subtitle(r),
            group: s.group,
            ...(s.link ? s.link(r) : {}),
          }));
        }),
      );
      if (!alive) return;
      setHits(results.flat());
      setLoading(false);
      setRan(true);
    })();
    return () => { alive = false; };
  }, [search.q]);

  const groups = [...new Set(hits.map((h) => h.group))];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Core</p>
        <h1 className="flex items-center gap-2 text-xl font-semibold"><SearchIcon className="h-5 w-5 text-primary" /> Universal search</h1>
      </header>

      <form
        onSubmit={(e) => { e.preventDefault(); navigate({ to: "/search", search: q.trim() ? { q: q.trim() } : {} } as never); }}
        className="flex gap-2"
      >
        <input
          aria-label="Search everything"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search clients, jobs, leads, estimates, people, documents…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Search</button>
      </form>

      {loading && <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}

      {!loading && ran && hits.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">No matches for “{search.q}”.</p>
      )}

      {!loading && groups.map((g) => (
        <section key={g} className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-2.5">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{g}</h2>
          </div>
          <ul className="divide-y divide-border">
            {hits.filter((h) => h.group === g).map((h) => (
              <li key={h.id} className="px-4 py-2.5">
                {h.to ? (
                  <Link to={h.to as never} params={h.params as never} className="block">
                    <p className="truncate text-sm font-medium text-primary hover:underline">{h.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{h.subtitle}</p>
                  </Link>
                ) : (
                  <>
                    <p className="truncate text-sm font-medium">{h.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{h.subtitle}</p>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export const Route = createFileRoute("/_hq/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : undefined }),
  head: () => ({ meta: [{ title: "Universal Search — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: UniversalSearch,
});
