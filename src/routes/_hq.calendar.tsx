import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Plus, X, MapPin, Clock, Trash2, Users, User as UserIcon, StickyNote, Video } from "lucide-react";
import { UserMention } from "@/components/hq/UserMention";

export const Route = createFileRoute("/_hq/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: CalendarPage,
});

type Event = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  location: string | null;
  color: string;
  visibility: string;
  meeting_id?: string | null;
};

type MeetingMeta = {
  id: string;
  host_id: string;
  host_name: string | null;
  attendee_count: number;
  attendees: { id: string; name: string }[];
  note_preview: string | null;
};

const COLORS = ["orange", "blue", "green", "purple", "pink", "red"];
const COLOR_STYLES: Record<string, string> = {
  orange: "bg-orange-500/20 text-orange-500 border-orange-500/40",
  blue: "bg-blue-500/20 text-blue-500 border-blue-500/40",
  green: "bg-green-500/20 text-green-500 border-green-500/40",
  purple: "bg-purple-500/20 text-purple-500 border-purple-500/40",
  pink: "bg-pink-500/20 text-pink-500 border-pink-500/40",
  red: "bg-red-500/20 text-red-500 border-red-500/40",
};

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function daysInMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); }
function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

function formatDuration(startIso: string, endIso: string, allDay: boolean) {
  if (allDay) return "All day";
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (ms <= 0) return "";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function CalendarPage() {
  const [me, setMe] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [meetingsMeta, setMeetingsMeta] = useState<Record<string, MeetingMeta>>({});
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Partial<Event>>({});

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    setMe(u.user?.id ?? null);
    const { data } = await supabase.from("calendar_events").select("*").order("starts_at", { ascending: true });
    const evs = (data ?? []) as Event[];
    setEvents(evs);
    const mIds = Array.from(new Set(evs.map((e) => e.meeting_id).filter(Boolean))) as string[];
    if (mIds.length) {
      const [{ data: mts }, { data: parts }, { data: notes }] = await Promise.all([
        supabase.from("meetings").select("id, host_id").in("id", mIds),
        supabase.from("meeting_participants").select("meeting_id, user_id").in("meeting_id", mIds),
        supabase.from("meeting_notes").select("meeting_id, body, content_md").in("meeting_id", mIds),
      ]);
      const hostIds = ((mts ?? []) as any[]).map((m) => m.host_id);
      const partUserIds = ((parts ?? []) as any[]).map((p) => p.user_id);
      const profileIds = Array.from(new Set([...hostIds, ...partUserIds]));
      const { data: profs } = profileIds.length
        ? await supabase.from("profiles").select("id, full_name, email").in("id", profileIds)
        : { data: [] as any[] };
      const nameMap = new Map<string, string>();
      (profs ?? []).forEach((h: any) => nameMap.set(h.id, h.full_name || h.email || "Someone"));
      const counts = new Map<string, number>();
      const names = new Map<string, { id: string; name: string }[]>();
      ((parts ?? []) as any[]).forEach((p) => {
        counts.set(p.meeting_id, (counts.get(p.meeting_id) ?? 0) + 1);
        const arr = names.get(p.meeting_id) ?? [];
        arr.push({ id: p.user_id, name: nameMap.get(p.user_id) ?? "Someone" });
        names.set(p.meeting_id, arr);
      });
      const noteMap = new Map<string, string>();
      ((notes ?? []) as any[]).forEach((n) => {
        const src = (n.content_md || n.body || "") as string;
        const preview = src.replace(/[#*_>`\-]/g, "").split("\n").map((l: string) => l.trim()).filter(Boolean).slice(0, 3).join(" · ");
        noteMap.set(n.meeting_id, preview.slice(0, 220));
      });
      const meta: Record<string, MeetingMeta> = {};
      ((mts ?? []) as any[]).forEach((m) => {
        meta[m.id] = {
          id: m.id,
          host_id: m.host_id,
          host_name: nameMap.get(m.host_id) ?? null,
          attendee_count: counts.get(m.id) ?? 0,
          attendees: names.get(m.id) ?? [],
          note_preview: noteMap.get(m.id) ?? null,
        };
      });
      setMeetingsMeta(meta);
    }
  };
  useEffect(() => { load(); }, []);


  const monthStart = startOfMonth(cursor);
  const monthDays = daysInMonth(cursor);
  const firstDow = monthStart.getDay();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= monthDays; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const e of events) {
      const start = new Date(e.starts_at);
      const key = start.toDateString();
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return map;
  }, [events]);

  const openNew = (day?: Date) => {
    const d = day ?? new Date();
    d.setHours(9, 0, 0, 0);
    const end = new Date(d.getTime() + 60 * 60 * 1000);
    setDraft({ title: "", description: "", starts_at: d.toISOString(), ends_at: end.toISOString(), all_day: false, location: "", color: "orange", visibility: "private" });
    setShowForm(true);
  };

  const save = async () => {
    if (!me || !draft.title?.trim()) return;
    const payload = {
      title: draft.title!.trim(),
      description: draft.description?.trim() || null,
      starts_at: draft.starts_at!,
      ends_at: draft.ends_at!,
      all_day: !!draft.all_day,
      location: draft.location?.trim() || null,
      color: draft.color ?? "orange",
      visibility: draft.visibility ?? "private",
    };
    if (draft.id) {
      const { data } = await supabase.from("calendar_events").update(payload).eq("id", draft.id).select().single();
      if (data) setEvents((prev) => prev.map((e) => (e.id === draft.id ? (data as Event) : e)));
    } else {
      const { data, error } = await supabase.from("calendar_events").insert({ ...payload, owner_id: me }).select().single();
      if (error) { alert(error.message); return; }
      if (data) setEvents((prev) => [...prev, data as Event]);
    }
    setShowForm(false);
  };

  const remove = async (e: Event) => {
    if (!confirm("Delete event?")) return;
    await supabase.from("calendar_events").delete().eq("id", e.id);
    setEvents((prev) => prev.filter((x) => x.id !== e.id));
    setShowForm(false);
  };

  const today = new Date();
  const dayEvents = selectedDay ? (eventsByDay.get(selectedDay.toDateString()) ?? []) : [];

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl gap-4 px-4 py-6">
      <section className="flex flex-1 flex-col rounded-xl border border-border bg-card">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <CalIcon className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">{cursor.toLocaleDateString([], { month: "long", year: "numeric" })}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="rounded-lg border border-border p-1.5 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setCursor(new Date())} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">Today</button>
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="rounded-lg border border-border p-1.5 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
            <button onClick={() => openNew(selectedDay ?? new Date())} className="ml-2 flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"><Plus className="h-3.5 w-3.5" /> Event</button>
          </div>
        </header>
        <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>
        <div className="grid flex-1 grid-cols-7 grid-rows-6 gap-px bg-border/40">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="bg-card/40" />;
            const isToday = sameDay(day, today);
            const isSelected = selectedDay && sameDay(day, selectedDay);
            const es = eventsByDay.get(day.toDateString()) ?? [];
            return (
              <button key={i} onClick={() => setSelectedDay(day)} onDoubleClick={() => openNew(day)} className={`flex flex-col items-start gap-1 bg-card p-1.5 text-left transition hover:bg-muted/40 ${isSelected ? "ring-2 ring-primary ring-inset" : ""}`}>
                <span className={`text-xs ${isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground" : "text-muted-foreground"}`}>{day.getDate()}</span>
                <div className="flex w-full flex-col gap-0.5 overflow-hidden">
                  {es.slice(0, 3).map((e) => (
                    <div key={e.id} className={`flex items-center gap-1 truncate rounded border px-1 py-0.5 text-[10px] ${COLOR_STYLES[e.color] ?? COLOR_STYLES.orange}`}>
                      {e.meeting_id && <Video className="h-2.5 w-2.5 shrink-0" />}
                      <span className="truncate">{!e.all_day && `${new Date(e.starts_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} `}{e.title}</span>
                    </div>
                  ))}
                  {es.length > 3 && <span className="text-[10px] text-muted-foreground">+{es.length - 3} more</span>}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="flex w-80 shrink-0 flex-col rounded-xl border border-border bg-card">
        <header className="border-b border-border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            {selectedDay ? selectedDay.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }) : "Upcoming"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{selectedDay ? "Events on this day" : "Next 5 events"}</p>
        </header>
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {(selectedDay ? dayEvents : events.filter((e) => new Date(e.ends_at) >= today).slice(0, 8)).map((e) => {
            const meta = e.meeting_id ? meetingsMeta[e.meeting_id] : null;
            return (
              <button key={e.id} onClick={() => { setDraft(e); setShowForm(true); }} className={`block w-full rounded-lg border p-3 text-left transition hover:shadow ${COLOR_STYLES[e.color] ?? COLOR_STYLES.orange}`}>
                <div className="flex items-center gap-1.5">
                  {e.meeting_id && <Video className="h-3 w-3 shrink-0" />}
                  <p className="text-sm font-semibold">{e.title}</p>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs opacity-80">
                  <Clock className="h-3 w-3" />
                  {e.all_day ? "All day" : `${new Date(e.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–${new Date(e.ends_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                  <span className="text-[10px] opacity-70">· {formatDuration(e.starts_at, e.ends_at, e.all_day)}</span>
                </p>
                {meta?.host_name && (
                  <p className="mt-1 flex flex-wrap items-center gap-1 text-xs opacity-80"><UserIcon className="h-3 w-3" /> Host: <UserMention userId={meta.host_id} name={meta.host_name} /></p>
                )}
                {meta && meta.attendee_count > 0 && (
                  <>
                    <p className="mt-1 flex items-center gap-1 text-xs opacity-80"><Users className="h-3 w-3" /> {meta.attendee_count} attendee{meta.attendee_count === 1 ? "" : "s"}</p>
                    <div className="mt-1 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                      {meta.attendees.slice(0, 6).map((a) => (
                        <UserMention key={a.id} userId={a.id} name={a.name} size="xs" />
                      ))}
                      {meta.attendees.length > 6 && <span className="text-[10px] opacity-70">+{meta.attendees.length - 6}</span>}
                    </div>
                  </>
                )}
                {e.location && <p className="mt-1 flex items-center gap-1 text-xs opacity-80"><MapPin className="h-3 w-3" /> {e.location}</p>}
                {e.description && !meta?.note_preview && (
                  <p className="mt-1 line-clamp-2 text-xs opacity-70">{e.description}</p>
                )}
                {meta?.note_preview && (
                  <div className="mt-2 rounded-md border border-current/20 bg-background/40 p-2 text-[11px] opacity-90">
                    <p className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider opacity-70"><StickyNote className="h-2.5 w-2.5" /> Notes preview</p>
                    <p className="line-clamp-3">{meta.note_preview}</p>
                  </div>
                )}
                {e.visibility === "team" && <p className="mt-1 text-[10px] uppercase tracking-wider opacity-70">Team-wide</p>}
              </button>
            );
          })}
          {(selectedDay ? dayEvents : events).length === 0 && (
            <p className="text-xs text-muted-foreground">No events. Click a date or "Event" to create one.</p>
          )}
        </div>
      </aside>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">{draft.id ? "Edit event" : "New event"}</h3>
              <button onClick={() => setShowForm(false)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <input autoFocus placeholder="Event title" value={draft.title ?? ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <textarea placeholder="Description (optional)" rows={2} value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!draft.all_day} onChange={(e) => setDraft({ ...draft, all_day: e.target.checked })} /> All day
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Starts</label>
                  <input type="datetime-local" value={draft.starts_at ? toLocalInput(draft.starts_at) : ""} onChange={(e) => setDraft({ ...draft, starts_at: new Date(e.target.value).toISOString() })} className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Ends</label>
                  <input type="datetime-local" value={draft.ends_at ? toLocalInput(draft.ends_at) : ""} onChange={(e) => setDraft({ ...draft, ends_at: new Date(e.target.value).toISOString() })} className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <input placeholder="Location (optional)" value={draft.location ?? ""} onChange={(e) => setDraft({ ...draft, location: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setDraft({ ...draft, color: c })} className={`h-7 w-7 rounded-full border-2 transition ${COLOR_STYLES[c]} ${draft.color === c ? "ring-2 ring-offset-2 ring-offset-card" : ""}`} aria-label={c} />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Visibility</label>
                <select value={draft.visibility ?? "private"} onChange={(e) => setDraft({ ...draft, visibility: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="private">Private (just me)</option>
                  <option value="team">Team-wide</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-2">
              {draft.id && draft.owner_id === me ? (
                <button onClick={() => remove(draft as Event)} className="rounded-lg border border-destructive/30 p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              ) : <span />}
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
                <button onClick={save} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
