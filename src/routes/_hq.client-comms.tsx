import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Send, Phone, Mail, MapPin, Building2, HardHat, FileSignature,
  CalendarClock, Sparkles, MessageCircle, ArrowUpRight, Loader2, Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_hq/client-comms")({
  head: () => ({
    meta: [
      { title: "Client Communication — McGuire HQ" },
      { name: "description", content: "Unified client conversation desk with project context, quick actions and history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientComms,
});

type Client = {
  id: string; name: string; company: string | null; email: string | null; phone: string | null;
  address: string | null; city: string | null; state: string | null; status: string | null; client_type: string | null;
};
type Msg = {
  id: string; client_id: string; body: string; from_client: boolean;
  author_name: string | null; created_at: string;
};
type Job = { id: string; job_number: string | null; name: string; stage: string | null; contract_value: number | null; percent_complete: number | null };
type Est = { id: string; estimate_number: string | null; title: string | null; status: string | null; total: number | null; created_at: string };

const money = (n: number | null | undefined) =>
  n == null ? "—" : n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

const initials = (v: string) =>
  v.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

function ClientComms() {
  const [clients, setClients] = useState<Client[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ests, setEsts] = useState<Est[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const [channel, setChannel] = useState<"portal" | "email" | "sms" | "note">("portal");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastByClient, setLastByClient] = useState<Record<string, Msg>>({});
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: m }] = await Promise.all([
        supabase.from("con_clients").select("id,name,company,email,phone,address,city,state,status,client_type").order("name"),
        supabase.from("con_client_messages").select("*").order("created_at", { ascending: false }).limit(400),
      ]);
      const list = (c ?? []) as Client[];
      setClients(list);
      const last: Record<string, Msg> = {};
      for (const row of (m ?? []) as Msg[]) if (!last[row.client_id]) last[row.client_id] = row;
      setLastByClient(last);
      setActiveId((prev) => prev ?? list[0]?.id ?? null);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    let alive = true;
    (async () => {
      const [{ data: m }, { data: j }, { data: e }] = await Promise.all([
        supabase.from("con_client_messages").select("*").eq("client_id", activeId).order("created_at"),
        supabase.from("con_jobs").select("id,job_number,name,stage,contract_value,percent_complete").eq("client_id", activeId).order("created_at", { ascending: false }).limit(8),
        supabase.from("con_estimates").select("id,estimate_number,title,status,total,created_at").eq("client_id", activeId).order("created_at", { ascending: false }).limit(8),
      ]);
      if (!alive) return;
      setMsgs((m ?? []) as Msg[]);
      setJobs((j ?? []) as Job[]);
      setEsts((e ?? []) as Est[]);
    })();

    const sub = supabase
      .channel(`client-comms-${activeId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "con_client_messages", filter: `client_id=eq.${activeId}` },
        (payload) => setMsgs((prev) => (prev.some((x) => x.id === (payload.new as Msg).id) ? prev : [...prev, payload.new as Msg])))
      .subscribe();
    return () => { alive = false; supabase.removeChannel(sub); };
  }, [activeId]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length]);

  const active = clients.find((c) => c.id === activeId) ?? null;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((c) =>
      [c.name, c.company, c.email, c.city].filter(Boolean).some((v) => v!.toLowerCase().includes(term)));
  }, [clients, q]);

  const send = async () => {
    const body = draft.trim();
    if (!body || !activeId) return;
    setSending(true);
    const { data: u } = await supabase.auth.getUser();
    const { data: p } = u.user
      ? await supabase.from("profiles").select("full_name").eq("id", u.user.id).maybeSingle()
      : { data: null as any };
    const prefix = channel === "note" ? "[internal note] " : channel === "email" ? "[email] " : channel === "sms" ? "[sms] " : "";
    const { data, error } = await supabase
      .from("con_client_messages")
      .insert({ client_id: activeId, body: prefix + body, from_client: false, author_id: u.user?.id ?? null, author_name: p?.full_name ?? u.user?.email ?? "Staff" })
      .select()
      .single();
    setSending(false);
    if (!error && data) {
      setDraft("");
      setMsgs((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, data as Msg]));
      setLastByClient((prev) => ({ ...prev, [activeId]: data as Msg }));
    }
  };

  const summary = useMemo(() => {
    const inbound = msgs.filter((m) => m.from_client).length;
    return {
      total: msgs.length,
      inbound,
      openJobs: jobs.filter((j) => j.stage && !["complete", "closed"].includes(j.stage)).length,
      pipeline: ests.reduce((s, e) => s + (e.total ?? 0), 0),
      contracted: jobs.reduce((s, j) => s + (j.contract_value ?? 0), 0),
    };
  }, [msgs, jobs, ests]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-muted/20">
      {/* Conversation list */}
      <aside className="flex w-[290px] shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold">Client Communication</h1>
            <Link to="/clients" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="All clients">
              <Plus className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search clients…"
              aria-label="Search clients"
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && <div className="flex justify-center py-8"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
          {!loading && filtered.length === 0 && <p className="px-4 py-6 text-center text-xs text-muted-foreground">No clients yet.</p>}
          {filtered.map((c) => {
            const last = lastByClient[c.id];
            const on = c.id === activeId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`flex w-full items-start gap-3 border-b border-border/60 px-3 py-2.5 text-left transition ${on ? "bg-primary/8" : "hover:bg-muted/60"}`}
              >
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {initials(c.name || "?")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-medium">{c.name}</span>
                    {last && <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(last.created_at)}</span>}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                    {last ? `${last.from_client ? "" : "You: "}${last.body}` : c.company || c.email || "No messages yet"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Conversation */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[12px] font-bold text-primary">
              {initials(active?.name || "?")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{active?.name ?? "Select a client"}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {[active?.company, active?.city, active?.state].filter(Boolean).join(" · ") || "Client conversation"}
              </p>
            </div>
            {active?.status && (
              <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 sm:inline">
                {active.status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {active?.phone && (
              <a href={`tel:${active.phone}`} className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[12px] hover:bg-muted">
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
            )}
            {active?.email && (
              <a href={`mailto:${active.email}`} className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[12px] hover:bg-muted">
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            )}
          </div>
        </header>

        <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {msgs.length === 0 && (
            <div className="mx-auto mt-16 max-w-xs text-center">
              <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium">No messages yet</p>
              <p className="text-xs text-muted-foreground">Start the conversation — the client sees it in their portal.</p>
            </div>
          )}
          {msgs.map((m) => {
            const note = m.body.startsWith("[internal note]");
            return (
              <div key={m.id} className={`flex ${m.from_client ? "justify-start" : "justify-end"}`}>
                <div className="max-w-[70%]">
                  <div className={`rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                    note
                      ? "border border-amber-500/30 bg-amber-500/10 text-foreground"
                      : m.from_client
                        ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                        : "bg-primary text-primary-foreground"
                  }`}>
                    {m.body.replace(/^\[(internal note|email|sms)\]\s/, "")}
                  </div>
                  <p className={`mt-1 text-[10px] text-muted-foreground ${m.from_client ? "" : "text-right"}`}>
                    {m.from_client ? active?.name : m.author_name || "You"} · {new Date(m.created_at).toLocaleString()}
                    {note && " · internal"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border bg-card px-5 py-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {(["portal", "email", "sms", "note"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setChannel(c)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium capitalize transition ${
                  channel === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {c === "note" ? "Internal note" : c}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
              rows={2}
              disabled={!activeId}
              aria-label="Message to client"
              placeholder={channel === "note" ? "Internal note — not visible to the client…" : `Message ${active?.name ?? "client"} — ⏎ send · ⇧⏎ new line`}
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={send}
              disabled={sending || !draft.trim() || !activeId}
              aria-label="Send message"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* Context rail */}
      <aside className="hidden w-[320px] shrink-0 flex-col overflow-y-auto border-l border-border bg-card xl:flex">
        {active ? (
          <div className="space-y-4 p-4">
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Contact details</p>
              <div className="mt-2 space-y-2 text-[12px]">
                {active.company && <p className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" />{active.company}</p>}
                {active.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{active.email}</p>}
                {active.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{active.phone}</p>}
                {(active.address || active.city) && (
                  <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {[active.address, active.city, active.state].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link to="/quotes" className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground">
                <FileSignature className="h-3.5 w-3.5" /> Quote
              </Link>
              <Link to="/jobs" className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-medium hover:bg-muted">
                <HardHat className="h-3.5 w-3.5" /> Job
              </Link>
              <Link to="/scheduling" className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-medium hover:bg-muted">
                <CalendarClock className="h-3.5 w-3.5" /> Schedule
              </Link>
              <Link to="/clients" className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-medium hover:bg-muted">
                <ArrowUpRight className="h-3.5 w-3.5" /> Profile
              </Link>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                <Sparkles className="h-3 w-3" /> Conversation summary
              </p>
              <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
                <li>{summary.total} messages · {summary.inbound} from client</li>
                <li>{summary.openJobs} active job{summary.openJobs === 1 ? "" : "s"}</li>
                <li>Contracted {money(summary.contracted)}</li>
                <li>Open quotes {money(summary.pipeline)}</li>
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Jobs</p>
              <div className="mt-2 space-y-1.5">
                {jobs.length === 0 && <p className="text-[12px] text-muted-foreground">No jobs on record.</p>}
                {jobs.map((j) => (
                  <Link key={j.id} to="/jobs/$id" params={{ id: j.id }} className="block rounded-lg border border-border p-2.5 hover:bg-muted/60">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] font-medium">{j.job_number ? `${j.job_number} · ` : ""}{j.name}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{money(j.contract_value)}</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, j.percent_complete ?? 0)}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Quotes</p>
              <div className="mt-2 space-y-1.5">
                {ests.length === 0 && <p className="text-[12px] text-muted-foreground">No quotes yet.</p>}
                {ests.map((e) => (
                  <Link key={e.id} to="/quotes/$id" params={{ id: e.id }} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2.5 hover:bg-muted/60">
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-medium">{e.estimate_number || e.title || "Quote"}</span>
                      <span className="text-[11px] capitalize text-muted-foreground">{e.status ?? "draft"}</span>
                    </span>
                    <span className="shrink-0 text-[11px] font-medium">{money(e.total)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="p-6 text-center text-xs text-muted-foreground">Select a client to see project context.</p>
        )}
      </aside>
    </div>
  );
}
