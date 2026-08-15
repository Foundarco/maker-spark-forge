import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Send, Phone, Mail, MapPin, Building2, HardHat, FileSignature,
  CalendarClock, Sparkles, MessageCircle, Loader2, Plus, ImageIcon, FileText,
  Receipt, Clock, Pencil, Check, X, Briefcase, Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_hq/client-comms")({
  head: () => ({
    meta: [
      { title: "Client Communication — Clovr Labs HQ" },
      { name: "description", content: "Unified client desk: property, documents, invoices, project history and conversation in one view." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientComms,
});

type Client = {
  id: string; name: string; company: string | null; email: string | null; phone: string | null;
  address: string | null; city: string | null; state: string | null; zip: string | null;
  status: string | null; client_type: string | null; notes: string | null;
  property_photo_url: string | null; property_type: string | null; work_address: string | null;
  preferred_contact: string | null; source: string | null; urgency: string | null; wants: string | null;
  client_since: string | null; lifetime_value: number | null; tags: string[] | null;
};
type Msg = { id: string; client_id: string; body: string; from_client: boolean; author_name: string | null; created_at: string };
type Job = { id: string; job_number: string | null; name: string; stage: string | null; contract_value: number | null; percent_complete: number | null; address: string | null; created_at: string };
type Est = { id: string; estimate_number: string | null; title: string | null; status: string | null; total: number | null; created_at: string };
type Inv = { id: string; invoice_number: string | null; total: number | null; status: string | null; due_date: string | null; created_at: string };
type Doc = { id: string; title: string; doc_type: string | null; file_url: string | null; created_at: string };

const money = (n: number | null | undefined) =>
  n == null ? "—" : n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};
const initials = (v: string) => v.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

const FIELDS: { key: keyof Client; label: string; type?: "date" | "number" }[] = [
  { key: "company", label: "Company" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Property address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "zip", label: "Zip" },
  { key: "property_type", label: "Property type" },
  { key: "work_address", label: "Place of work" },
  { key: "preferred_contact", label: "Preferred contact" },
  { key: "source", label: "Source" },
  { key: "urgency", label: "Urgency" },
  { key: "wants", label: "Wants" },
  { key: "client_since", label: "Client since", type: "date" },
  { key: "lifetime_value", label: "Lifetime value", type: "number" },
  { key: "property_photo_url", label: "Property photo URL" },
];

function ClientComms() {
  const [clients, setClients] = useState<Client[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ests, setEsts] = useState<Est[]>([]);
  const [invs, setInvs] = useState<Inv[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const [channel, setChannel] = useState<"portal" | "email" | "sms" | "note">("portal");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastByClient, setLastByClient] = useState<Record<string, Msg>>({});
  const [tab, setTab] = useState<"profile" | "property" | "documents">("profile");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Client>>({});
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: m }] = await Promise.all([
        supabase.from("con_clients").select("*").order("name"),
        supabase.from("con_client_messages").select("*").order("created_at", { ascending: false }).limit(500),
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
    setEditing(false);
    (async () => {
      const [{ data: m }, { data: j }, { data: e }, { data: i }, { data: d }] = await Promise.all([
        supabase.from("con_client_messages").select("*").eq("client_id", activeId).order("created_at"),
        supabase.from("con_jobs").select("id,job_number,name,stage,contract_value,percent_complete,address,created_at").eq("client_id", activeId).order("created_at", { ascending: false }).limit(12),
        supabase.from("con_estimates").select("id,estimate_number,title,status,total,created_at").eq("client_id", activeId).order("created_at", { ascending: false }).limit(12),
        supabase.from("fin_invoices").select("id,invoice_number,total,status,due_date,created_at").eq("client_id", activeId).order("created_at", { ascending: false }).limit(12),
        supabase.from("con_documents").select("id,title,doc_type,file_url,created_at").eq("entity_type", "client").eq("entity_id", activeId).order("created_at", { ascending: false }).limit(30),
      ]);
      if (!alive) return;
      setMsgs((m ?? []) as Msg[]); setJobs((j ?? []) as Job[]); setEsts((e ?? []) as Est[]);
      setInvs((i ?? []) as Inv[]); setDocs((d ?? []) as Doc[]);
    })();

    const sub = supabase
      .channel(`client-comms-${activeId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "con_client_messages", filter: `client_id=eq.${activeId}` },
        (payload) => setMsgs((prev) => (prev.some((x) => x.id === (payload.new as Msg).id) ? prev : [...prev, payload.new as Msg])))
      .subscribe();
    return () => { alive = false; supabase.removeChannel(sub); };
  }, [activeId]);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [msgs.length]);

  const active = clients.find((c) => c.id === activeId) ?? null;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((c) => [c.name, c.company, c.email, c.city, c.address].filter(Boolean).some((v) => v!.toLowerCase().includes(term)));
  }, [clients, q]);

  const send = async () => {
    const body = draft.trim();
    if (!body || !activeId) return;
    setSending(true);
    const { data: u } = await supabase.auth.getUser();
    const { data: p } = u.user ? await supabase.from("profiles").select("full_name").eq("id", u.user.id).maybeSingle() : { data: null as any };
    const prefix = channel === "note" ? "[internal note] " : channel === "email" ? "[email] " : channel === "sms" ? "[sms] " : "";
    const { data, error } = await supabase
      .from("con_client_messages")
      .insert({ client_id: activeId, body: prefix + body, from_client: false, author_id: u.user?.id ?? null, author_name: p?.full_name ?? u.user?.email ?? "Staff" })
      .select().single();
    setSending(false);
    if (!error && data) {
      setDraft("");
      setMsgs((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, data as Msg]));
      setLastByClient((prev) => ({ ...prev, [activeId]: data as Msg }));
    }
  };

  const startEdit = () => { if (active) { setForm({ ...active }); setEditing(true); } };
  const saveEdit = async () => {
    if (!active) return;
    const patch: Record<string, unknown> = {};
    for (const f of FIELDS) {
      const v = (form as any)[f.key];
      patch[f.key as string] = v === "" ? null : f.type === "number" ? Number(v) || 0 : v;
    }
    const { data, error } = await supabase.from("con_clients").update(patch as never).eq("id", active.id).select().single();
    if (!error && data) {
      setClients((prev) => prev.map((c) => (c.id === active.id ? (data as Client) : c)));
      setEditing(false);
    }
  };

  const summary = useMemo(() => ({
    total: msgs.length,
    inbound: msgs.filter((m) => m.from_client).length,
    openJobs: jobs.filter((j) => j.stage && !["complete", "closed"].includes(j.stage)).length,
    pipeline: ests.filter((e) => e.status !== "won" && e.status !== "lost").reduce((s, e) => s + (e.total ?? 0), 0),
    contracted: jobs.reduce((s, j) => s + (j.contract_value ?? 0), 0),
    outstanding: invs.filter((i) => i.status !== "paid").reduce((s, i) => s + (i.total ?? 0), 0),
  }), [msgs, jobs, ests, invs]);

  const timeline = useMemo(() => {
    const items = [
      ...jobs.map((j) => ({ id: `j${j.id}`, at: j.created_at, kind: "Job", label: `${j.job_number ?? ""} ${j.name}`.trim(), to: `/jobs/${j.id}` })),
      ...ests.map((e) => ({ id: `e${e.id}`, at: e.created_at, kind: "Quote", label: e.estimate_number || e.title || "Quote", to: `/quotes/${e.id}` })),
      ...invs.map((i) => ({ id: `i${i.id}`, at: i.created_at, kind: "Invoice", label: i.invoice_number || "Invoice", to: "/invoices" })),
      ...docs.map((d) => ({ id: `d${d.id}`, at: d.created_at, kind: "Document", label: d.title, to: "/documents" })),
    ];
    return items.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 12);
  }, [jobs, ests, invs, docs]);

  const Stat = ({ label, value }: { label: string; value: string }) => (
    <div className="border-b border-r border-border px-3 py-2.5 last:border-r-0">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-[13px] font-semibold">{value}</p>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] gap-3 overflow-hidden bg-muted/20 p-3">
      {/* Conversation list */}
      <aside className="flex w-[260px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold">Clients</h1>
            <Link to="/clients" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="All clients"><Plus className="h-4 w-4" /></Link>
          </div>
          <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-muted px-2.5 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…" aria-label="Search clients"
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading && <div className="flex justify-center py-8"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
          {!loading && filtered.length === 0 && <p className="px-4 py-6 text-center text-xs text-muted-foreground">No clients yet.</p>}
          {filtered.map((c) => {
            const last = lastByClient[c.id];
            const on = c.id === activeId;
            return (
              <button key={c.id} onClick={() => setActiveId(c.id)}
                className={`mb-1 flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition ${on ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/60"}`}>
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {initials(c.name || "?")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-medium">{c.name}</span>
                    {last && <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(last.created_at)}</span>}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                    {last ? `${last.from_client ? "" : "You: "}${last.body}` : c.company || c.city || "No messages yet"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Client profile pane */}
      <aside className="hidden w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card lg:flex">
        {active ? (
          <>
            <div className="relative h-[150px] shrink-0 bg-gradient-to-br from-slate-800 to-slate-950">
              {active.property_photo_url ? (
                <img src={active.property_photo_url} alt={`${active.name} property`} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 text-white/40">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-[10px] uppercase tracking-widest">No property photo</span>
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white">
                {active.property_type || "Property"}
              </span>
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/85 to-transparent px-3 pb-3 pt-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-[13px] font-bold text-primary-foreground">{initials(active.name)}</span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-white">{active.name}</p>
                  <p className="truncate text-[10px] uppercase tracking-widest text-white/70">{active.client_type || "Customer"}{active.city ? ` · ${active.city}` : ""}</p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1.5">
              {(["profile", "property", "documents"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium capitalize transition ${tab === t ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {tab === "profile" && (
                <div className="space-y-4 p-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Contact details</p>
                      {editing ? (
                        <div className="flex gap-1">
                          <button onClick={saveEdit} aria-label="Save client" className="rounded-md p-1 text-emerald-600 hover:bg-muted"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setEditing(false)} aria-label="Cancel edit" className="rounded-md p-1 text-muted-foreground hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      ) : (
                        <button onClick={startEdit} aria-label="Edit client" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                      )}
                    </div>
                    {editing ? (
                      <div className="mt-2 space-y-2">
                        {FIELDS.map((f) => (
                          <label key={String(f.key)} className="block">
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{f.label}</span>
                            <input
                              type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"}
                              value={((form as any)[f.key] ?? "") as string}
                              onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                              className="mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2 text-[12px]">
                        {active.company && <p className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><span className="truncate">{active.company}</span></p>}
                        {active.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><span className="truncate">{active.email}</span></p>}
                        {active.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />{active.phone}</p>}
                        {(active.address || active.city) && (
                          <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            {[active.address, active.city, active.state, active.zip].filter(Boolean).join(", ")}</p>
                        )}
                        {active.work_address && <p className="flex items-start gap-2"><Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />{active.work_address}</p>}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Quick actions</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Link to="/quotes" className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground"><FileSignature className="h-3.5 w-3.5" /> Quote</Link>
                      <Link to="/jobs" className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-medium hover:bg-muted"><HardHat className="h-3.5 w-3.5" /> Job</Link>
                      <Link to="/scheduling" className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-medium hover:bg-muted"><CalendarClock className="h-3.5 w-3.5" /> Schedule</Link>
                      <Link to="/invoices" className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-medium hover:bg-muted"><Receipt className="h-3.5 w-3.5" /> Invoice</Link>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"><Sparkles className="h-3 w-3" /> Conversation summary</p>
                    <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
                      <li>{summary.total} messages · {summary.inbound} from client</li>
                      <li>{summary.openJobs} active job{summary.openJobs === 1 ? "" : "s"}</li>
                      <li>Open quotes {money(summary.pipeline)}</li>
                      <li>Outstanding {money(summary.outstanding)}</li>
                    </ul>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Overview</p>
                    <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border">
                      <Stat label="Lifetime" value={money(active.lifetime_value ?? summary.contracted)} />
                      <Stat label="Outstanding" value={money(summary.outstanding)} />
                      <Stat label="Jobs" value={`${summary.openJobs}/${jobs.length}`} />
                      <Stat label="Quotes" value={`${ests.length}`} />
                      <Stat label="Since" value={active.client_since ? new Date(active.client_since).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "—"} />
                      <Stat label="Source" value={active.source || "Unknown"} />
                      <Stat label="Urgency" value={active.urgency || "Normal"} />
                      <Stat label="Wants" value={active.wants || "—"} />
                    </div>
                  </div>
                </div>
              )}

              {tab === "property" && (
                <div className="space-y-3 p-4 text-[12px]">
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Home / project site</p>
                    <p className="mt-1">{[active.address, active.city, active.state, active.zip].filter(Boolean).join(", ") || "No address on file"}</p>
                    {active.address && (
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([active.address, active.city, active.state].filter(Boolean).join(" "))}`}
                        target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
                        <MapPin className="h-3 w-3" /> View on map
                      </a>
                    )}
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Place of work</p>
                    <p className="mt-1">{active.work_address || "Not recorded"}</p>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Notes</p>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{active.notes || "No notes."}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sites & jobs</p>
                    {jobs.length === 0 && <p className="text-muted-foreground">No jobs on record.</p>}
                    {jobs.map((j) => (
                      <Link key={j.id} to="/jobs/$id" params={{ id: j.id }} className="mb-1.5 block rounded-lg border border-border p-2.5 hover:bg-muted/60">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium">{j.job_number ? `${j.job_number} · ` : ""}{j.name}</span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">{money(j.contract_value)}</span>
                        </div>
                        {j.address && <p className="truncate text-[11px] text-muted-foreground">{j.address}</p>}
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, j.percent_complete ?? 0)}%` }} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {tab === "documents" && (
                <div className="space-y-4 p-4 text-[12px]">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Documents</p>
                    {docs.length === 0 && <p className="text-muted-foreground">No documents filed for this client.</p>}
                    {docs.map((d) => (
                      <a key={d.id} href={d.file_url ?? "#"} target="_blank" rel="noreferrer"
                        className="mb-1.5 flex items-center gap-2 rounded-lg border border-border p-2.5 hover:bg-muted/60">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{d.title}</span>
                        <span className="shrink-0 text-[10px] uppercase text-muted-foreground">{d.doc_type || "file"}</span>
                      </a>
                    ))}
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Quotes</p>
                    {ests.length === 0 && <p className="text-muted-foreground">No quotes yet.</p>}
                    {ests.map((e) => (
                      <Link key={e.id} to="/quotes/$id" params={{ id: e.id }} className="mb-1.5 flex items-center justify-between gap-2 rounded-lg border border-border p-2.5 hover:bg-muted/60">
                        <span className="min-w-0"><span className="block truncate font-medium">{e.estimate_number || e.title || "Quote"}</span>
                          <span className="text-[11px] capitalize text-muted-foreground">{e.status ?? "draft"}</span></span>
                        <span className="shrink-0 text-[11px] font-medium">{money(e.total)}</span>
                      </Link>
                    ))}
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Invoices</p>
                    {invs.length === 0 && <p className="text-muted-foreground">No invoices yet.</p>}
                    {invs.map((i) => (
                      <div key={i.id} className="mb-1.5 flex items-center justify-between gap-2 rounded-lg border border-border p-2.5">
                        <span className="min-w-0"><span className="block truncate font-medium">{i.invoice_number || "Invoice"}</span>
                          <span className="text-[11px] capitalize text-muted-foreground">{i.status ?? "draft"}{i.due_date ? ` · due ${new Date(i.due_date).toLocaleDateString()}` : ""}</span></span>
                        <span className="shrink-0 text-[11px] font-medium">{money(i.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="p-6 text-center text-xs text-muted-foreground">Select a client.</p>
        )}
      </aside>

      {/* Conversation */}
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="truncate text-sm font-semibold">{active?.name ?? "Conversation"}</p>
            {active?.status && (
              <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 sm:inline">{active.status}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {active?.phone && <a href={`tel:${active.phone}`} className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[12px] hover:bg-muted"><Phone className="h-3.5 w-3.5" /> Call</a>}
            {active?.email && <a href={`mailto:${active.email}`} className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[12px] hover:bg-muted"><Mail className="h-3.5 w-3.5" /> Email</a>}
          </div>
        </header>

        <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto bg-muted/20 px-5 py-4">
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
                <div className="max-w-[68%]">
                  <div className={`rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                    note ? "border border-amber-500/30 bg-amber-500/10 text-foreground"
                      : m.from_client ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "bg-primary text-primary-foreground"}`}>
                    {m.body.replace(/^\[(internal note|email|sms)\]\s/, "")}
                  </div>
                  <p className={`mt-1 text-[10px] text-muted-foreground ${m.from_client ? "" : "text-right"}`}>
                    {m.from_client ? active?.name : m.author_name || "You"} · {new Date(m.created_at).toLocaleString()}{note && " · internal"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border px-5 py-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {(["portal", "email", "sms", "note"] as const).map((c) => (
              <button key={c} onClick={() => setChannel(c)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium capitalize transition ${channel === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {c === "note" ? "Internal note" : c}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
              rows={2} disabled={!activeId} aria-label="Message to client"
              placeholder={channel === "note" ? "Internal note — not visible to the client…" : `Message ${active?.name ?? "client"} — ⏎ send · ⇧⏎ new line`}
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={send} disabled={sending || !draft.trim() || !activeId} aria-label="Send message"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* Journey rail */}
      <aside className="hidden w-[300px] shrink-0 flex-col overflow-y-auto rounded-2xl border border-border bg-card p-4 xl:flex">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"><Activity className="h-3 w-3" /> Customer journey</p>
        {active && (
          <div className="mt-3 rounded-xl border border-border p-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[12px] font-bold text-primary">{initials(active.name)}</span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold">{active.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{active.client_type || "Customer"} · {active.status || "active"}</p>
              </div>
            </div>
            <div className="mt-2.5 space-y-1 text-[11px] text-muted-foreground">
              {active.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{active.phone}</p>}
              {active.email && <p className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3 shrink-0" />{active.email}</p>}
            </div>
          </div>
        )}
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Recent activity</p>
        <div className="mt-2 space-y-2">
          {timeline.length === 0 && <p className="text-[12px] text-muted-foreground">Nothing recorded yet.</p>}
          {timeline.map((t) => (
            <div key={t.id} className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0 flex-1 rounded-lg border border-border p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[12px] font-medium">{t.label}</span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(t.at)}</span>
                </div>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />{t.kind}
                </span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
