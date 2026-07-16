import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, Plus, Search, Trash2, ArrowUp, X, TrendingUp, Users, Filter, Calendar as CalIcon, Zap } from "lucide-react";

export const Route = createFileRoute("/_hq/rd-ideas")({
  head: () => ({ meta: [{ title: "Ideas — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: IdeasPage,
});

type Idea = {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string;
  impact: number;
  effort: number;
  upvotes: number;
  created_at: string;
};

type Profile = { id: string; full_name: string | null; email: string | null };

const STATUSES = ["new", "reviewing", "planned", "in-progress", "done", "archived"] as const;
type SortKey = "recent" | "top" | "roi" | "impact";
const CATEGORIES = ["Product", "Manufacturing", "Sales", "Marketing", "Operations", "R&D", "Culture", "Other"];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  reviewing: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  planned: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "in-progress": "bg-primary/10 text-primary border-primary/20",
  done: "bg-green-500/10 text-green-500 border-green-500/20",
  archived: "bg-muted text-muted-foreground border-border",
};

const VOTE_KEY = "hq-idea-votes";
function loadVoted(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(VOTE_KEY) ?? "[]")); } catch { return new Set(); }
}
function saveVoted(s: Set<string>) {
  if (typeof window !== "undefined") localStorage.setItem(VOTE_KEY, JSON.stringify([...s]));
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("top");
  const [error, setError] = useState<string | null>(null);
  const [voted, setVoted] = useState<Set<string>>(loadVoted);
  const [detail, setDetail] = useState<Idea | null>(null);

  const [form, setForm] = useState({ title: "", description: "", category: "Product", impact: 3, effort: 3 });

  const load = async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    setUserId(u.user?.id ?? null);
    const { data, error } = await supabase.from("ideas").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    const list = (data ?? []) as Idea[];
    setIdeas(list);
    const authorIds = Array.from(new Set(list.map((i) => i.author_id)));
    if (authorIds.length) {
      const { data: p } = await supabase.from("profiles").select("id, full_name, email").in("id", authorIds);
      const map: Record<string, Profile> = {};
      (p ?? []).forEach((row: any) => { map[row.id] = row; });
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const arr = ideas.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (categoryFilter !== "all" && i.category !== categoryFilter) return false;
      if (search && !`${i.title} ${i.description ?? ""} ${i.category ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    return arr.sort((a, b) => {
      if (sort === "top") return b.upvotes - a.upvotes;
      if (sort === "impact") return b.impact - a.impact;
      if (sort === "roi") return (b.impact / b.effort) - (a.impact / a.effort);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [ideas, search, statusFilter, categoryFilter, sort]);

  const stats = useMemo(() => ({
    total: ideas.length,
    inProgress: ideas.filter((i) => i.status === "in-progress" || i.status === "planned").length,
    done: ideas.filter((i) => i.status === "done").length,
    contributors: new Set(ideas.map((i) => i.author_id)).size,
  }), [ideas]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !form.title.trim()) return;
    setError(null);
    const { error } = await supabase.from("ideas").insert({
      author_id: userId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      impact: form.impact,
      effort: form.effort,
    });
    if (error) { setError(error.message); return; }
    setForm({ title: "", description: "", category: "Product", impact: 3, effort: 3 });
    setShowForm(false);
    load();
  };

  const toggleVote = async (idea: Idea) => {
    const has = voted.has(idea.id);
    const delta = has ? -1 : 1;
    const nextVoted = new Set(voted);
    if (has) nextVoted.delete(idea.id); else nextVoted.add(idea.id);
    setVoted(nextVoted); saveVoted(nextVoted);
    setIdeas((prev) => prev.map((i) => (i.id === idea.id ? { ...i, upvotes: Math.max(0, i.upvotes + delta) } : i)));
    await supabase.from("ideas").update({ upvotes: Math.max(0, idea.upvotes + delta) }).eq("id", idea.id);
  };

  const updateStatus = async (idea: Idea, status: string) => {
    const { error } = await supabase.from("ideas").update({ status }).eq("id", idea.id);
    if (!error) {
      setIdeas((prev) => prev.map((i) => (i.id === idea.id ? { ...i, status } : i)));
      if (detail?.id === idea.id) setDetail({ ...idea, status });
    }
  };

  const remove = async (idea: Idea) => {
    if (!confirm("Delete this idea?")) return;
    const { error } = await supabase.from("ideas").delete().eq("id", idea.id);
    if (!error) {
      setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
      if (detail?.id === idea.id) setDetail(null);
    }
  };

  const authorName = (id: string) => profiles[id]?.full_name || profiles[id]?.email || "Unknown";

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Core · Ideas</p>
            <h1 className="text-3xl font-semibold tracking-tight">Ideas board</h1>
            <p className="text-sm text-muted-foreground">Share, vote, and track ideas from anyone on the team.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:opacity-90"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "New idea"}
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total ideas", value: stats.total, icon: Lightbulb },
          { label: "In flight", value: stats.inProgress, icon: Zap },
          { label: "Shipped", value: stats.done, icon: TrendingUp },
          { label: "Contributors", value: stats.contributors, icon: Users },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{s.value}</p>
            </div>
          );
        })}
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="A short summary of your idea"
              required
              autoFocus
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="What's the idea, why does it matter, and what would it change? Include context, examples, or links."
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Impact</span><span className="font-bold text-foreground">{form.impact}/5</span>
              </label>
              <input type="range" min={1} max={5} value={form.impact} onChange={(e) => setForm({ ...form, impact: Number(e.target.value) })} className="w-full accent-primary" />
            </div>
            <div>
              <label className="mb-1 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Effort</span><span className="font-bold text-foreground">{form.effort}/5</span>
              </label>
              <input type="range" min={1} max={5} value={form.effort} onChange={(e) => setForm({ ...form, effort: Number(e.target.value) })} className="w-full accent-primary" />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Submit idea</button>
          </div>
        </form>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ideas…" className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1">
          <Filter className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent px-1 py-1 text-sm outline-none">
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="text-muted-foreground">·</span>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-transparent px-1 py-1 text-sm outline-none">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-border bg-card text-xs">
          {(["top", "recent", "roi", "impact"] as SortKey[]).map((k) => (
            <button key={k} onClick={() => setSort(k)} className={`px-3 py-2 transition ${sort === k ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
              {k === "top" ? "Top voted" : k === "recent" ? "Newest" : k === "roi" ? "Best ROI" : "Impact"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading ideas…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Lightbulb className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {ideas.length === 0 ? "No ideas yet. Be the first to share one!" : "No ideas match your filters."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((idea) => {
            const mine = idea.author_id === userId;
            const has = voted.has(idea.id);
            const author = authorName(idea.author_id);
            const roi = (idea.impact / idea.effort).toFixed(1);
            return (
              <li key={idea.id} onClick={() => setDetail(idea)} className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${STATUS_COLORS[idea.status] ?? STATUS_COLORS.new}`}>
                        {idea.status}
                      </span>
                      {idea.category && (
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {idea.category}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-semibold group-hover:text-primary">{idea.title}</h3>
                    {idea.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{idea.description}</p>}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleVote(idea); }}
                    className={`flex flex-col items-center gap-0.5 rounded-lg border px-2.5 py-1.5 text-xs transition ${has ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary hover:bg-primary/5"}`}
                    aria-label="Upvote"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                    <span className="font-bold">{idea.upvotes}</span>
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded bg-muted/40 p-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Impact</p>
                    <p className="font-bold">{idea.impact}/5</p>
                  </div>
                  <div className="rounded bg-muted/40 p-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Effort</p>
                    <p className="font-bold">{idea.effort}/5</p>
                  </div>
                  <div className="rounded bg-primary/10 p-2 text-primary">
                    <p className="text-[10px] uppercase tracking-wider">ROI</p>
                    <p className="font-bold">{roi}×</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {initials(author)}
                    </div>
                    <span className="truncate">{author}</span>
                  </div>
                  <span className="flex shrink-0 items-center gap-1"><CalIcon className="h-3 w-3" /> {timeAgo(idea.created_at)}</span>
                </div>

                {mine && (
                  <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                    <select value={idea.status} onClick={(e) => e.stopPropagation()} onChange={(e) => updateStatus(idea, e.target.value)} className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs outline-none">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={(e) => { e.stopPropagation(); remove(idea); }} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDetail(null)}>
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${STATUS_COLORS[detail.status] ?? STATUS_COLORS.new}`}>{detail.status}</span>
                  {detail.category && <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{detail.category}</span>}
                </div>
                <h2 className="mt-2 text-2xl font-semibold">{detail.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">by {authorName(detail.author_id)} · {timeAgo(detail.created_at)}</p>
              </div>
              <button onClick={() => setDetail(null)} className="rounded-lg p-2 hover:bg-muted" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            {detail.description ? (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{detail.description}</p>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground italic">No description provided.</p>
            )}
            <div className="mt-6 grid grid-cols-4 gap-3 text-center">
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Votes</p>
                <p className="text-xl font-bold">{detail.upvotes}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Impact</p>
                <p className="text-xl font-bold">{detail.impact}/5</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Effort</p>
                <p className="text-xl font-bold">{detail.effort}/5</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <p className="text-[10px] uppercase tracking-wider">ROI</p>
                <p className="text-xl font-bold">{(detail.impact / detail.effort).toFixed(1)}×</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
              <button onClick={() => toggleVote(detail)} className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${voted.has(detail.id) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary"}`}>
                <ArrowUp className="h-4 w-4" /> {voted.has(detail.id) ? "Voted" : "Upvote"}
              </button>
              {detail.author_id === userId && (
                <div className="flex items-center gap-2">
                  <select value={detail.status} onChange={(e) => updateStatus(detail, e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => remove(detail)} className="rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive hover:bg-destructive/10">Delete</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
