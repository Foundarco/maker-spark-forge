import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Video, Plus, Calendar as CalIcon, MapPin, X, Clock, Check, XCircle, HelpCircle, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_hq/meetings")({
  head: () => ({ meta: [{ title: "Meetings — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: MeetingsPage,
});

type Meeting = { id: string; title: string; description: string | null; host_id: string; starts_at: string; ends_at: string; location: string | null; join_url: string | null; status: string; created_at: string };
type Participant = { meeting_id: string; user_id: string; rsvp: string };
type Profile = { id: string; full_name: string | null; email: string | null };

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
  const [tab, setTab] = useState<"upcoming" | "past" | "mine">("upcoming");
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(() => {
    const now = new Date(); now.setMinutes(0); now.setSeconds(0);
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    return { title: "", description: "", starts_at: toLocalInput(now.toISOString()), ends_at: toLocalInput(end.toISOString()), location: "", join_url: "" };
  });

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    setMe(u.user?.id ?? null);
    const { data: m } = await supabase.from("meetings").select("*").order("starts_at", { ascending: true });
    setMeetings((m ?? []) as Meeting[]);
    const { data: pa } = await supabase.from("meeting_participants").select("*");
    setParticipants((pa ?? []) as Participant[]);
    const ids = Array.from(new Set((m ?? []).map((x: any) => x.host_id)));
    if (ids.length) {
      const { data: p } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
      const map: Record<string, Profile> = {};
      (p ?? []).forEach((row: any) => { map[row.id] = row; });
      setProfiles(map);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    return meetings.filter((m) => {
      const end = new Date(m.ends_at);
      if (tab === "upcoming") return end >= now;
      if (tab === "past") return end < now;
      return m.host_id === me;
    });
  }, [meetings, tab, me]);

  const rsvpFor = (mid: string) => participants.find((p) => p.meeting_id === mid && p.user_id === me)?.rsvp;
  const attendeeCount = (mid: string) => participants.filter((p) => p.meeting_id === mid && p.rsvp === "yes").length;

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
    if (!me) return;
    const { error } = await supabase.from("meetings").insert({
      title: form.title.trim(),
      description: form.description.trim() || null,
      host_id: me,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      location: form.location.trim() || null,
      join_url: form.join_url.trim() || null,
    });
    if (error) { alert(error.message); return; }
    setShowNew(false);
    load();
  };

  const remove = async (m: Meeting) => {
    if (!confirm("Delete this meeting?")) return;
    await supabase.from("meetings").delete().eq("id", m.id);
    setMeetings((prev) => prev.filter((x) => x.id !== m.id));
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
            <h1 className="text-3xl font-semibold tracking-tight">Calls & Meetings</h1>
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
            return (
              <li key={m.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalIcon className="h-3.5 w-3.5" />
                      {start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                      <Clock className="h-3.5 w-3.5" />
                      {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–{end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold">{m.title}</h3>
                    {m.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{m.description}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Hosted by {host}</span>
                      {m.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {m.location}</span>}
                      <span>{attendeeCount(m.id)} attending</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {m.join_url && !isPast && (
                      <a href={m.join_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                        Join <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
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

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowNew(false)}>
          <form onSubmit={create} className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Schedule meeting</h3>
              <button type="button" onClick={() => setShowNew(false)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <input required autoFocus placeholder="Meeting title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <textarea placeholder="Agenda / description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
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
              <input placeholder="Join URL (optional)" value={form.join_url} onChange={(e) => setForm({ ...form, join_url: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
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
