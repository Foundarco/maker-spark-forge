import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Lightbulb, Plus, Search, Trash2, ArrowUp, X, TrendingUp, Users, Filter,
  Calendar as CalIcon, Zap, EyeOff, ShieldCheck, MessageCircle, Send, Check, XCircle, UserPlus, ClipboardCheck,
} from "lucide-react";

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
  is_anonymous: boolean;
  approval_status: string; // pending | approved | denied
  assigned_to: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
};

type Comment = {
  id: string;
  idea_id: string;
  author_id: string;
  body: string;
  is_anonymous: boolean;
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

const APPROVAL_META: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending review", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  approved: { label: "Approved", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  denied: { label: "Denied", className: "bg-destructive/10 text-destructive border-destructive/20" },
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
  const [teammates, setTeammates] = useState<Profile[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("top");
  const [error, setError] = useState<string | null>(null);
  const [voted, setVoted] = useState<Set<string>>(loadVoted);
  const [detail, setDetail] = useState<Idea | null>(null);

  const [form, setForm] = useState({ title: "", description: "", category: "Product", impact: 3, effort: 3, is_anonymous: false });

  const load = async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    setUserId(u.user?.id ?? null);
    if (u.user) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id);
      setIsAdmin((roles ?? []).some((r: { role: string }) => r.role === "admin" || r.role === "super_admin"));
    }
    const { data, error } = await supabase.from("ideas").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    const list = (data ?? []) as Idea[];
    setIdeas(list);
    const authorIds = Array.from(new Set([...list.map((i) => i.author_id), ...list.map((i) => i.assigned_to).filter(Boolean) as string[]]));
    if (authorIds.length) {
      const { data: p } = await supabase.from("profiles").select("id, full_name, email").in("id", authorIds);
      const map: Record<string, Profile> = {};
      (p ?? []).forEach((row: any) => { map[row.id] = row; });
      setProfiles(map);
    }
    // Teammates for assignment dropdown (admin only need it, but cheap to load)
    const { data: all } = await supabase.from("profiles").select("id, full_name, email").order("full_name");
    setTeammates((all ?? []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Realtime: keep list fresh across users
  useEffect(() => {
    const ch = supabase
      .channel("ideas-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "ideas" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const n = payload.new as Idea;
          setIdeas((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev]));
        } else if (payload.eventType === "UPDATE") {
          const n = payload.new as Idea;
          setIdeas((prev) => prev.map((x) => (x.id === n.id ? n : x)));
          setDetail((d) => (d && d.id === n.id ? n : d));
        } else if (payload.eventType === "DELETE") {
          const o = payload.old as Idea;
          setIdeas((prev) => prev.filter((x) => x.id !== o.id));
          setDetail((d) => (d && d.id === o.id ? null : d));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = useMemo(() => {
    const arr = ideas.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (categoryFilter !== "all" && i.category !== categoryFilter) return false;
      if (approvalFilter !== "all" && i.approval_status !== approvalFilter) return false;
      if (search && !`${i.title} ${i.description ?? ""} ${i.category ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    return arr.sort((a, b) => {
      if (sort === "top") return b.upvotes - a.upvotes;
      if (sort === "impact") return b.impact - a.impact;
      if (sort === "roi") return (b.impact / b.effort) - (a.impact / a.effort);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [ideas, search, statusFilter, categoryFilter, approvalFilter, sort]);

  const stats = useMemo(() => ({
    total: ideas.length,
    pending: ideas.filter((i) => i.approval_status === "pending").length,
    approved: ideas.filter((i) => i.approval_status === "approved").length,
    done: ideas.filter((i) => i.status === "done").length,
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
      is_anonymous: form.is_anonymous,
    } as any);
    if (error) { setError(error.message); return; }
    setForm({ title: "", description: "", category: "Product", impact: 3, effort: 3, is_anonymous: false });
    setShowForm(false);
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
    if (error) alert(error.message);
  };

  const setApproval = async (idea: Idea, approval_status: "approved" | "denied", note?: string) => {
    if (!userId) return;
    const patch: any = { approval_status, reviewed_by: userId, reviewed_at: new Date().toISOString() };
    if (note !== undefined) patch.review_note = note || null;
    const { error } = await supabase.from("ideas").update(patch).eq("id", idea.id);
    if (error) alert(error.message);
  };

  const assign = async (idea: Idea, assignee: string | null) => {
    const { error } = await supabase.from("ideas").update({ assigned_to: assignee }).eq("id", idea.id);
    if (error) alert(error.message);
  };

  const remove = async (idea: Idea) => {
    if (!confirm("Delete this idea?")) return;
    const { error } = await supabase.from("ideas").delete().eq("id", idea.id);
    if (error) alert(error.message);
  };

  // Show real author name unless anonymous (and viewer isn't admin/author)
  const displayAuthor = (idea: Idea): { name: string; masked: boolean } => {
    if (idea.is_anonymous && !isAdmin && idea.author_id !== userId) {
      return { name: "Anonymous", masked: true };
    }
    const p = profiles[idea.author_id];
    const name = p?.full_name || p?.email || "Someone";
    return { name, masked: idea.is_anonymous };
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Core · Ideas & Tips</p>
            <h1 className="text-3xl font-semibold tracking-tight">Ideas board</h1>
            <p className="text-sm text-muted-foreground">Share ideas, drop anonymous tips, discuss in threads. Admins approve, deny, and assign.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:opacity-90"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "New idea or tip"}
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total submissions", value: stats.total, icon: Lightbulb },
          { label: "Pending review", value: stats.pending, icon: ClipboardCheck },
          { label: "Approved", value: stats.approved, icon: ShieldCheck },
          { label: "Shipped", value: stats.done, icon: TrendingUp },
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
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-xl border border-border bg-card p-5">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="A short summary of your idea or tip" required autoFocus className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Details</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="What's the idea, why does it matter, and what would it change? Include context, examples, or links." className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
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
          <label className="flex items-start gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-sm">
            <input type="checkbox" checked={form.is_anonymous} onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })} className="mt-0.5" />
            <span>
              <span className="flex items-center gap-1 font-medium"><EyeOff className="h-3.5 w-3.5" /> Submit as anonymous tip</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Your name will be hidden from teammates. Super-admins can still see the submitter for audit and abuse prevention.
              </span>
            </span>
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Submit</button>
          </div>
        </form>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ideas…" className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-2 py-1">
          <Filter className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
          <select value={approvalFilter} onChange={(e) => setApprovalFilter(e.target.value)} className="bg-transparent px-1 py-1 text-sm outline-none">
            <option value="all">All approvals</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
          <span className="text-muted-foreground">·</span>
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
            const has = voted.has(idea.id);
            const author = displayAuthor(idea);
            const roi = (idea.impact / idea.effort).toFixed(1);
            const approval = APPROVAL_META[idea.approval_status] ?? APPROVAL_META.pending;
            const assignee = idea.assigned_to ? profiles[idea.assigned_to] : null;
            return (
              <li key={idea.id} onClick={() => setDetail(idea)} className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${approval.className}`}>{approval.label}</span>
                      <span className={`rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${STATUS_COLORS[idea.status] ?? STATUS_COLORS.new}`}>{idea.status}</span>
                      {idea.category && <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{idea.category}</span>}
                      {idea.is_anonymous && <span className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"><EyeOff className="h-3 w-3" /> Anon</span>}
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
                  <div className="rounded bg-muted/40 p-2"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Impact</p><p className="font-bold">{idea.impact}/5</p></div>
                  <div className="rounded bg-muted/40 p-2"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Effort</p><p className="font-bold">{idea.effort}/5</p></div>
                  <div className="rounded bg-primary/10 p-2 text-primary"><p className="text-[10px] uppercase tracking-wider">ROI</p><p className="font-bold">{roi}×</p></div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {author.masked ? <EyeOff className="h-3 w-3" /> : initials(author.name)}
                    </div>
                    <span className="truncate">{author.name}</span>
                  </div>
                  <span className="flex shrink-0 items-center gap-1"><CalIcon className="h-3 w-3" /> {timeAgo(idea.created_at)}</span>
                </div>

                {assignee && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <UserPlus className="h-3 w-3" /> Assigned to <span className="font-medium text-foreground">{assignee.full_name || assignee.email}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {detail && (
        <IdeaDetail
          idea={detail}
          onClose={() => setDetail(null)}
          userId={userId}
          isAdmin={isAdmin}
          profiles={profiles}
          teammates={teammates}
          voted={voted}
          onVote={toggleVote}
          onStatus={updateStatus}
          onApprove={(note) => setApproval(detail, "approved", note)}
          onDeny={(note) => setApproval(detail, "denied", note)}
          onAssign={(uid) => assign(detail, uid)}
          onDelete={() => remove(detail)}
          displayAuthor={displayAuthor}
        />
      )}
    </div>
  );
}

// ---------- Detail modal with thread ----------

function IdeaDetail(props: {
  idea: Idea;
  onClose: () => void;
  userId: string | null;
  isAdmin: boolean;
  profiles: Record<string, Profile>;
  teammates: Profile[];
  voted: Set<string>;
  onVote: (i: Idea) => void;
  onStatus: (i: Idea, s: string) => void;
  onApprove: (note: string) => void;
  onDeny: (note: string) => void;
  onAssign: (uid: string | null) => void;
  onDelete: () => void;
  displayAuthor: (i: Idea) => { name: string; masked: boolean };
}) {
  const { idea, onClose, userId, isAdmin, profiles, teammates, voted, onVote, onStatus, onApprove, onDeny, onAssign, onDelete, displayAuthor } = props;
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [commentAnon, setCommentAnon] = useState(false);
  const [reviewNote, setReviewNote] = useState(idea.review_note ?? "");
  const [posting, setPosting] = useState(false);
  const [commentProfiles, setCommentProfiles] = useState<Record<string, Profile>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("idea_comments").select("*").eq("idea_id", idea.id).order("created_at", { ascending: true });
      const list = (data ?? []) as Comment[];
      setComments(list);
      const ids = Array.from(new Set(list.map((c) => c.author_id)));
      if (ids.length) {
        const { data: p } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
        const map: Record<string, Profile> = {};
        (p ?? []).forEach((row: any) => { map[row.id] = row; });
        setCommentProfiles(map);
      }
    })();
  }, [idea.id]);

  useEffect(() => {
    const ch = supabase
      .channel(`idea-comments-${idea.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "idea_comments", filter: `idea_id=eq.${idea.id}` }, (payload) => {
        const c = payload.new as Comment;
        setComments((prev) => {
          if (prev.some((x) => x.id === c.id)) return prev;
          const idx = prev.findIndex((x) => x.id.startsWith("tmp-") && x.author_id === c.author_id && x.body === c.body);
          if (idx >= 0) { const next = prev.slice(); next[idx] = c; return next; }
          return [...prev, c];
        });
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "idea_comments", filter: `idea_id=eq.${idea.id}` }, (payload) => {
        const id = (payload.old as any).id as string;
        setComments((prev) => prev.filter((x) => x.id !== id));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [idea.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [comments]);

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim() || !userId) return;
    setPosting(true);
    const body = commentBody.trim();
    const anon = commentAnon;
    setCommentBody("");
    setCommentAnon(false);
    const tempId = `tmp-${crypto.randomUUID()}`;
    setComments((prev) => [...prev, { id: tempId, idea_id: idea.id, author_id: userId, body, is_anonymous: anon, created_at: new Date().toISOString() }]);
    const { data, error } = await supabase.from("idea_comments").insert({ idea_id: idea.id, author_id: userId, body, is_anonymous: anon }).select().single();
    if (error) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      alert(error.message);
    } else if (data) {
      setComments((prev) => prev.map((c) => (c.id === tempId ? (data as Comment) : c)));
    }
    setPosting(false);
  };

  const removeComment = async (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    await supabase.from("idea_comments").delete().eq("id", id);
  };

  const commentAuthor = (c: Comment) => {
    if (c.is_anonymous && !isAdmin && c.author_id !== userId) return { name: "Anonymous", masked: true };
    const p = commentProfiles[c.author_id] || profiles[c.author_id];
    return { name: p?.full_name || p?.email || "Someone", masked: c.is_anonymous };
  };

  const author = displayAuthor(idea);
  const approval = APPROVAL_META[idea.approval_status] ?? APPROVAL_META.pending;
  const canEditStatus = isAdmin || idea.author_id === userId || idea.assigned_to === userId;
  const assignee = idea.assigned_to ? teammates.find((t) => t.id === idea.assigned_to) : null;
  const reviewer = idea.reviewed_by ? teammates.find((t) => t.id === idea.reviewed_by) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-border p-6 pb-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${approval.className}`}>{approval.label}</span>
              <span className={`rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${STATUS_COLORS[idea.status] ?? STATUS_COLORS.new}`}>{idea.status}</span>
              {idea.category && <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{idea.category}</span>}
              {idea.is_anonymous && <span className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"><EyeOff className="h-3 w-3" /> Anonymous</span>}
            </div>
            <h2 className="mt-2 text-2xl font-semibold">{idea.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              by {author.name}{author.masked && isAdmin ? " (admin view)" : ""} · {timeAgo(idea.created_at)}
              {assignee && <> · assigned to <span className="font-medium text-foreground">{assignee.full_name || assignee.email}</span></>}
            </p>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-lg p-2 hover:bg-muted" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {idea.description ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{idea.description}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground">No description provided.</p>
          )}

          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="rounded-lg bg-muted/40 p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Votes</p><p className="text-xl font-bold">{idea.upvotes}</p></div>
            <div className="rounded-lg bg-muted/40 p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Impact</p><p className="text-xl font-bold">{idea.impact}/5</p></div>
            <div className="rounded-lg bg-muted/40 p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Effort</p><p className="text-xl font-bold">{idea.effort}/5</p></div>
            <div className="rounded-lg bg-primary/10 p-3 text-primary"><p className="text-[10px] uppercase tracking-wider">ROI</p><p className="text-xl font-bold">{(idea.impact / idea.effort).toFixed(1)}×</p></div>
          </div>

          {idea.review_note && (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> Reviewer note{reviewer && <> · {reviewer.full_name || reviewer.email}</>}
              </p>
              <p className="whitespace-pre-wrap">{idea.review_note}</p>
            </div>
          )}

          {isAdmin && (
            <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary"><ShieldCheck className="h-3.5 w-3.5" /> Admin controls</p>
              <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={2} placeholder="Optional review note (visible to everyone)…" className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => onApprove(reviewNote)} className="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"><Check className="h-3.5 w-3.5" /> Approve</button>
                <button onClick={() => onDeny(reviewNote)} className="flex items-center gap-1 rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:opacity-90"><XCircle className="h-3.5 w-3.5" /> Deny</button>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1 text-xs">
                  <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                  <select
                    value={idea.assigned_to ?? ""}
                    onChange={(e) => onAssign(e.target.value || null)}
                    className="bg-transparent py-1 pr-2 text-xs outline-none"
                  >
                    <option value="">Unassigned</option>
                    {teammates.map((t) => <option key={t.id} value={t.id}>{t.full_name || t.email}</option>)}
                  </select>
                </div>
                <button onClick={onDelete} className="ml-auto flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
              </div>
            </div>
          )}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><MessageCircle className="h-4 w-4" /> Discussion ({comments.length})</h3>
              {canEditStatus && (
                <select value={idea.status} onChange={(e) => onStatus(idea, e.target.value)} className="rounded border border-border bg-background px-2 py-1 text-xs outline-none">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>
            <div ref={scrollRef} className="max-h-72 space-y-3 overflow-y-auto rounded-lg border border-border bg-background/50 p-3">
              {comments.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No comments yet. Start the discussion.</p>
              ) : comments.map((c) => {
                const a = commentAuthor(c);
                const mine = c.author_id === userId;
                const opt = c.id.startsWith("tmp-");
                return (
                  <div key={c.id} className="group flex gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {a.masked ? <EyeOff className="h-3 w-3" /> : initials(a.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold">{a.name}</span>
                        {a.masked && isAdmin && <span className="text-[9px] italic text-muted-foreground">admin view</span>}
                        <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                        {opt && <span className="text-[10px] italic text-muted-foreground">sending…</span>}
                      </div>
                      <p className={`whitespace-pre-wrap text-sm ${opt ? "opacity-70" : ""}`}>{c.body}</p>
                    </div>
                    {(mine || isAdmin) && !opt && (
                      <button onClick={() => removeComment(c.id)} className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100" aria-label="Delete comment">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <form onSubmit={postComment} className="mt-3 space-y-2">
              <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary">
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(e as any); } }}
                  rows={1}
                  placeholder="Add to the discussion…"
                  className="max-h-32 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button type="submit" disabled={!commentBody.trim() || posting} className="rounded-lg bg-primary p-2 text-primary-foreground disabled:opacity-40" aria-label="Post"><Send className="h-4 w-4" /></button>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={commentAnon} onChange={(e) => setCommentAnon(e.target.checked)} />
                <EyeOff className="h-3 w-3" /> Post anonymously (admins can still see who you are)
              </label>
            </form>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border p-4">
          <button onClick={() => onVote(idea)} className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${voted.has(idea.id) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary"}`}>
            <ArrowUp className="h-4 w-4" /> {voted.has(idea.id) ? "Voted" : "Upvote"} · {idea.upvotes}
          </button>
          {idea.author_id === userId && !isAdmin && (
            <button onClick={onDelete} className="rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive hover:bg-destructive/10">Delete my idea</button>
          )}
        </div>
      </div>
    </div>
  );
}
