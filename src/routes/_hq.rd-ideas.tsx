import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, Plus, Search, Trash2, ArrowUp, X } from "lucide-react";

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
const CATEGORIES = ["Product", "Manufacturing", "Sales", "Marketing", "Operations", "R&D", "Culture", "Other"];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  reviewing: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  planned: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "in-progress": "bg-primary/10 text-primary border-primary/20",
  done: "bg-green-500/10 text-green-500 border-green-500/20",
  archived: "bg-muted text-muted-foreground border-border",
};

function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Product",
    impact: 3,
    effort: 3,
  });

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
    return ideas.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (search && !`${i.title} ${i.description ?? ""} ${i.category ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [ideas, search, statusFilter]);

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

  const upvote = async (idea: Idea) => {
    const { error } = await supabase.from("ideas").update({ upvotes: idea.upvotes + 1 }).eq("id", idea.id);
    if (!error) setIdeas((prev) => prev.map((i) => (i.id === idea.id ? { ...i, upvotes: i.upvotes + 1 } : i)));
  };

  const updateStatus = async (idea: Idea, status: string) => {
    const { error } = await supabase.from("ideas").update({ status }).eq("id", idea.id);
    if (!error) setIdeas((prev) => prev.map((i) => (i.id === idea.id ? { ...i, status } : i)));
  };

  const remove = async (idea: Idea) => {
    if (!confirm("Delete this idea?")) return;
    const { error } = await supabase.from("ideas").delete().eq("id", idea.id);
    if (!error) setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
  };

  const authorName = (id: string) => {
    const p = profiles[id];
    return p?.full_name || p?.email || "Unknown";
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Core · Ideas</p>
            <h1 className="text-3xl font-semibold tracking-tight">Ideas board</h1>
            <p className="text-sm text-muted-foreground">Share and vote on ideas from anyone on the team.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "New idea"}
        </button>
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
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="What's the idea, why does it matter, and what would it change?"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Impact ({form.impact})</label>
              <input type="range" min={1} max={5} value={form.impact} onChange={(e) => setForm({ ...form, impact: Number(e.target.value) })} className="w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Effort ({form.effort})</label>
              <input type="range" min={1} max={5} value={form.effort} onChange={(e) => setForm({ ...form, effort: Number(e.target.value) })} className="w-full" />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Submit idea</button>
          </div>
        </form>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ideas…"
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
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
        <ul className="grid gap-4 md:grid-cols-2">
          {filtered.map((idea) => {
            const mine = idea.author_id === userId;
            return (
              <li key={idea.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
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
                    <h3 className="mt-2 font-semibold">{idea.title}</h3>
                    {idea.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{idea.description}</p>}
                  </div>
                  <button
                    onClick={() => upvote(idea)}
                    className="flex flex-col items-center gap-0.5 rounded-lg border border-border px-2 py-1.5 text-xs hover:border-primary hover:bg-primary/5"
                    aria-label="Upvote"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                    <span className="font-semibold">{idea.upvotes}</span>
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span>{authorName(idea.author_id)}</span>
                    <span>·</span>
                    <span>Impact {idea.impact}/5</span>
                    <span>·</span>
                    <span>Effort {idea.effort}/5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {mine && (
                      <>
                        <select
                          value={idea.status}
                          onChange={(e) => updateStatus(idea, e.target.value)}
                          className="rounded border border-border bg-background px-2 py-1 text-xs outline-none"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => remove(idea)} className="rounded p-1 text-muted-foreground hover:text-destructive" aria-label="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
