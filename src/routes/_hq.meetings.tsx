import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Video, Plus, Calendar as CalIcon, MapPin, X, Clock, Check, XCircle, HelpCircle, Trash2,
  Users, Mail, Copy, Link as LinkIcon, UserPlus, Search,
} from "lucide-react";
import { UserMention } from "@/components/hq/UserMention";

export const Route = createFileRoute("/_hq/meetings")({
  head: () => ({ meta: [{ title: "Meetings — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: MeetingsPage,
});

type Meeting = { id: string; title: string; description: string | null; host_id: string; starts_at: string; ends_at: string; location: string | null; join_url: string | null; status: string; created_at: string };
type Participant = { meeting_id: string; user_id: string; rsvp: string };
type Profile = { id: string; full_name: string | null; email: string | null; department: string | null };
type ExtInvite = { id: string; meeting_id: string; email: string; name: string | null; token: string; joined_at: string | null };

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function MeetingsPage() {
  const [me, setMe] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [extInvites, setExtInvites] = useState<ExtInvite[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past" | "mine">("upcoming");
  const [showNew, setShowNew] = useState(false);
  const [detailOpen, setDetailOpen] = useState<Meeting | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [form, setForm] = useState(() => {
    const now = new Date(); now.setMinutes(0); now.setSeconds(0);
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    return {
      title: "", description: "",
      starts_at: toLocalInput(now.toISOString()),
      ends_at: toLocalInput(end.toISOString()),
      location: "",
      color: "orange" as string,
      teammates: [] as string[],
      externals: [] as { email: string; name: string }[],
      recurrence: "none" as "none" | "daily" | "weekly" | "biweekly" | "monthly",
      occurrences: 4,
    };
  });
  const [teamSearch, setTeamSearch] = useState("");
  const [extEmail, setExtEmail] = useState("");
  const [extName, setExtName] = useState("");

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    setMe(u.user?.id ?? null);
    const [{ data: m }, { data: pa }, { data: p }, { data: ei }] = await Promise.all([
      supabase.from("meetings").select("*").order("starts_at", { ascending: true }),
      supabase.from("meeting_participants").select("*"),
      supabase.from("profiles").select("id, full_name, email, department").order("full_name"),
      supabase.from("meeting_external_invites").select("*"),
    ]);
    setMeetings((m ?? []) as Meeting[]);
    setParticipants((pa ?? []) as Participant[]);
    setAllProfiles((p ?? []) as Profile[]);
    setExtInvites((ei ?? []) as ExtInvite[]);
    const map: Record<string, Profile> = {};
    (p ?? []).forEach((row: any) => { map[row.id] = row; });
    setProfiles(map);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    return meetings.filter((m) => {
      if ((m as any).ended_at) return false; // hide meetings the host explicitly ended
      const end = new Date(m.ends_at);
      if (tab === "upcoming") return end >= now;
      if (tab === "past") return end < now;
      return m.host_id === me;
    });
  }, [meetings, tab, me]);

  const rsvpFor = (mid: string) => participants.find((p) => p.meeting_id === mid && p.user_id === me)?.rsvp;
  const attending = (mid: string) => participants.filter((p) => p.meeting_id === mid && p.rsvp !== "no");

  const setRsvp = async (mid: string, rsvp: string) => {
    if (!me) return;
    const existing = participants.find((p) => p.meeting_id === mid && p.user_id === me);
    if (existing) {
      await supabase.from("meeting_participants").update({ rsvp }).eq("meeting_id", mid).eq("user_id", me);
      setParticipants((prev) => prev.map((p) => (p.meeting_id === mid && p.user_id === me ? { ...p, rsvp } : p)));
    } else {
      await supabase.from("meeting_participants").insert({ meeting_id: mid, user_id: me, rsvp });
      setParticipants((prev) => [...prev, { meeting_id: mid, user_id: me, rsvp }]);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me || !form.title.trim()) return;
    const startsIso = new Date(form.starts_at).toISOString();
    const endsIso = new Date(form.ends_at).toISOString();

    // Build occurrence list based on recurrence
    const stepDays = form.recurrence === "daily" ? 1
      : form.recurrence === "weekly" ? 7
      : form.recurrence === "biweekly" ? 14
      : form.recurrence === "monthly" ? 0 // month step handled below
      : null;
    const total = form.recurrence === "none" ? 1 : Math.max(1, Math.min(24, form.occurrences));
    const occurrences: { starts: string; ends: string }[] = [];
    for (let i = 0; i < total; i++) {
      let s = new Date(startsIso);
      let en = new Date(endsIso);
      if (stepDays !== null && i > 0) {
        if (form.recurrence === "monthly") {
          s.setMonth(s.getMonth() + i);
          en.setMonth(en.getMonth() + i);
        } else {
          s.setDate(s.getDate() + stepDays * i);
          en.setDate(en.getDate() + stepDays * i);
        }
      }
      occurrences.push({ starts: s.toISOString(), ends: en.toISOString() });
    }

    const inviteeIds = Array.from(new Set([me, ...form.teammates]));

    for (const occ of occurrences) {
      const { data: mData, error } = await supabase.from("meetings").insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        host_id: me,
        starts_at: occ.starts,
        ends_at: occ.ends,
        location: form.location.trim() || null,
      }).select().single();
      if (error || !mData) { alert(error?.message ?? "Failed"); return; }

      if (inviteeIds.length) {
        await supabase.from("meeting_participants").upsert(
          inviteeIds.map((uid) => ({ meeting_id: mData.id, user_id: uid, rsvp: uid === me ? "yes" : "invited" })),
          { onConflict: "meeting_id,user_id" },
        );
      }

      const evPayload = inviteeIds.map((uid) => ({
        owner_id: uid,
        title: form.title.trim(),
        description: form.description.trim() || null,
        starts_at: occ.starts,
        ends_at: occ.ends,
        all_day: false,
        location: form.location.trim() || null,
        color: form.color,
        visibility: "private",
        meeting_id: mData.id,
      }));
      if (evPayload.length) await supabase.from("calendar_events").insert(evPayload);

      if (form.externals.length) {
        await supabase.from("meeting_external_invites").insert(
          form.externals.map((x) => ({ meeting_id: mData.id, email: x.email, name: x.name || null, invited_by: me })),
        );
      }
    }

    setShowNew(false);
    setForm({
      title: "", description: "",
      starts_at: toLocalInput(new Date().toISOString()),
      ends_at: toLocalInput(new Date(Date.now() + 3600000).toISOString()),
      location: "", color: "orange", teammates: [], externals: [],
      recurrence: "none", occurrences: 4,
    });
    load();
  };

  const remove = async (m: Meeting) => {
    if (!confirm("Delete this meeting? It'll also be removed from attendees' calendars.")) return;
    await supabase.from("calendar_events").delete().eq("meeting_id", m.id);
    await supabase.from("meetings").delete().eq("id", m.id);
    setMeetings((prev) => prev.filter((x) => x.id !== m.id));
    setDetailOpen(null);
  };

  const copyLink = async (m: Meeting, token?: string) => {
    // Preview hosts require Lovable auth; share via the public custom domain so guests can join.
    const host = window.location.hostname.toLowerCase();
    const isPublicHost =
      host === "hq.clovrlab.com" ||
      host === "clovrlab.com" ||
      host === "www.clovrlab.com";
    const origin = isPublicHost ? window.location.origin : "https://hq.clovrlab.com";
    const base = `${origin}/meeting/${m.id}`;
    const url = token ? `${base}?t=${token}` : base;
    await navigator.clipboard.writeText(url);
    setCopiedId(m.id + (token ?? ""));
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredTeam = allProfiles.filter((p) =>
    p.id !== me && (
      !teamSearch ||
      (p.full_name ?? "").toLowerCase().includes(teamSearch.toLowerCase()) ||
      (p.email ?? "").toLowerCase().includes(teamSearch.toLowerCase())
    )
  );

  const addExternal = () => {
    const email = extEmail.trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { alert("Enter a valid email"); return; }
    if (form.externals.some((x) => x.email === email)) return;
    setForm({ ...form, externals: [...form.externals, { email, name: extName.trim() }] });
    setExtEmail(""); setExtName("");
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Communication · Meetings</p>
            <h1 className="text-3xl font-semibold tracking-tight">Meetings</h1>
          </div>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" /> Schedule
        </button>
      </div>

      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-card p-1 text-sm w-fit">
        {(["upcoming", "past", "mine"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-3 py-1.5 transition ${tab === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
            {t === "mine" ? "Hosted by me" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <CalIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No meetings to show.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((m) => {
            const rsvp = rsvpFor(m.id);
            const host = profiles[m.host_id]?.full_name || profiles[m.host_id]?.email || "Someone";
            const start = new Date(m.starts_at);
            const end = new Date(m.ends_at);
            const isPast = end < new Date();
            const attendees = attending(m.id);
            const externals = extInvites.filter((x) => x.meeting_id === m.id);
            return (
              <li key={m.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div role="button" tabIndex={0} onClick={() => setDetailOpen(m)} onKeyDown={(e) => { if (e.key === "Enter") setDetailOpen(m); }} className="min-w-0 flex-1 cursor-pointer text-left">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalIcon className="h-3.5 w-3.5" />
                      {start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                      <Clock className="h-3.5 w-3.5" />
                      {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–{end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold">{m.title}</h3>
                    {m.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{m.description}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">Hosted by <UserMention userId={m.host_id} name={host} /></span>
                      {m.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {m.location}</span>}
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{attendees.length} teammate{attendees.length === 1 ? "" : "s"}</span>
                      {externals.length > 0 && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{externals.length} guest{externals.length === 1 ? "" : "s"}</span>}
                    </div>
                    {(attendees.length > 0 || externals.length > 0) && (
                      <div className="mt-2 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                        {attendees.slice(0, 8).map((p) => {
                          const prof = profiles[p.user_id];
                          const name = prof?.full_name || prof?.email || "Unknown";
                          const tone = p.rsvp === "yes" ? "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20"
                            : p.rsvp === "no" ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
                            : p.rsvp === "maybe" ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20"
                            : "border-border bg-muted/50 text-muted-foreground hover:bg-muted";
                          return <UserMention key={p.user_id} userId={p.user_id} name={name} tone={tone} />;
                        })}
                        {attendees.length > 8 && <span className="text-[11px] text-muted-foreground">+{attendees.length - 8} more</span>}
                        {externals.slice(0, 4).map((x) => (
                          <span key={x.id} className="inline-flex items-center gap-1 rounded-full border border-dashed border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground" title={`Guest · ${x.email}`}>
                            <Mail className="h-2.5 w-2.5" />{x.name || x.email}{x.joined_at ? " ✓" : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!isPast && (
                      <Link to="/meeting/$id" params={{ id: m.id }} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                        <Video className="h-3 w-3" /> Join room
                      </Link>
                    )}
                    <button onClick={() => copyLink(m)} className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted">
                      {copiedId === m.id ? <Check className="h-3 w-3" /> : <LinkIcon className="h-3 w-3" />}
                      Copy link
                    </button>
                    {!isPast && (
                      <div className="flex gap-1">
                        {([["yes", Check], ["maybe", HelpCircle], ["no", XCircle]] as const).map(([k, Icon]) => (
                          <button key={k} onClick={() => setRsvp(m.id, k)} className={`rounded-md border p-1.5 text-xs transition ${rsvp === k ? (k === "yes" ? "border-green-500 bg-green-500/10 text-green-500" : k === "no" ? "border-destructive bg-destructive/10 text-destructive" : "border-yellow-500 bg-yellow-500/10 text-yellow-500") : "border-border hover:bg-muted"}`} aria-label={k}>
                            <Icon className="h-3.5 w-3.5" />
                          </button>
                        ))}
                      </div>
                    )}
                    {m.host_id === me && (
                      <button onClick={() => remove(m)} className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Detail modal */}
      {detailOpen && (() => {
        const m = detailOpen;
        const attendees = participants.filter((p) => p.meeting_id === m.id);
        const externals = extInvites.filter((x) => x.meeting_id === m.id);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDetailOpen(null)}>
            <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{m.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(m.starts_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <button onClick={() => setDetailOpen(null)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              {m.description && <p className="mb-3 text-sm text-muted-foreground">{m.description}</p>}
              <div className="mb-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Teammates</p>
                {attendees.length === 0 ? <p className="text-xs text-muted-foreground">Just the host.</p> : (
                  <ul className="space-y-1">
                    {attendees.map((p) => {
                      const nm = profiles[p.user_id]?.full_name || profiles[p.user_id]?.email || "Unknown";
                      return (
                        <li key={p.user_id} className="flex items-center justify-between text-sm">
                          <UserMention userId={p.user_id} name={nm} />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.rsvp}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              {externals.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">External guests</p>
                  <ul className="space-y-1">
                    {externals.map((x) => (
                      <li key={x.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate">{x.name ? `${x.name} · ` : ""}{x.email}{x.joined_at ? " ✓" : ""}</span>
                        <button onClick={() => copyLink(m, x.token)} className="shrink-0 rounded border border-border px-2 py-0.5 text-[10px] hover:bg-muted">
                          {copiedId === m.id + x.token ? "Copied" : "Copy guest link"}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => copyLink(m)} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">
                  {copiedId === m.id ? "Copied" : "Copy team link"}
                </button>
                <Link to="/meeting/$id" params={{ id: m.id }} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Join room</Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* New meeting */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowNew(false)}>
          <form onSubmit={create} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Schedule meeting</h3>
              <button type="button" onClick={() => setShowNew(false)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <input required autoFocus placeholder="Meeting title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <textarea placeholder="Agenda / description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Starts</label>
                  <input required type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Ends</label>
                  <input required type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <input placeholder="Location (optional)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />

              {/* Recurrence */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Repeats</label>
                  <select value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value as typeof form.recurrence })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Every 2 weeks</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                {form.recurrence !== "none" && (
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Occurrences (max 24)</label>
                    <input type="number" min={1} max={24} value={form.occurrences} onChange={(e) => setForm({ ...form, occurrences: Math.max(1, Math.min(24, Number(e.target.value) || 1)) })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                )}
              </div>

              {/* Teammates */}
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
                  <UserPlus className="h-3 w-3" /> Invite teammates
                </label>
                {form.teammates.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {form.teammates.map((tid) => {
                      const p = allProfiles.find((x) => x.id === tid);
                      return (
                        <span key={tid} className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {p?.full_name || p?.email || "Unknown"}
                          <button type="button" onClick={() => setForm({ ...form, teammates: form.teammates.filter((x) => x !== tid) })}><X className="h-3 w-3" /></button>
                        </span>
                      );
                    })}
                  </div>
                )}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  <input value={teamSearch} onChange={(e) => setTeamSearch(e.target.value)} placeholder="Search teammates…" className="w-full rounded-lg border border-border bg-background pl-7 pr-2 py-2 text-sm outline-none focus:border-primary" />
                </div>
                {teamSearch && (
                  <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-border bg-background">
                    {filteredTeam.length === 0 ? (
                      <p className="p-2 text-xs text-muted-foreground">No matches.</p>
                    ) : filteredTeam.map((p) => {
                      const already = form.teammates.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          disabled={already}
                          onClick={() => { setForm({ ...form, teammates: [...form.teammates, p.id] }); setTeamSearch(""); }}
                          className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-muted disabled:opacity-40"
                        >
                          <span>{p.full_name || p.email}</span>
                          {p.department && <span className="text-[10px] text-muted-foreground">{p.department}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* External guests */}
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
                  <Mail className="h-3 w-3" /> Invite external guests
                </label>
                {form.externals.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {form.externals.map((x) => (
                      <span key={x.email} className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                        {x.name ? `${x.name} · ` : ""}{x.email}
                        <button type="button" onClick={() => setForm({ ...form, externals: form.externals.filter((y) => y.email !== x.email) })}><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={extName} onChange={(e) => setExtName(e.target.value)} placeholder="Name (optional)" className="w-32 rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:border-primary" />
                  <input value={extEmail} onChange={(e) => setExtEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addExternal(); } }} placeholder="guest@example.com" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <button type="button" onClick={addExternal} className="rounded-lg border border-border px-3 text-sm hover:bg-muted">Add</button>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">Guests get a unique join link (copy it from the meeting after saving).</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowNew(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Schedule</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
