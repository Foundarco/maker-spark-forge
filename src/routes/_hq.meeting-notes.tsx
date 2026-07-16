import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StickyNote, Plus, Search, X, Trash2, Tag as TagIcon, Users, Mic, Square } from "lucide-react";

export const Route = createFileRoute("/_hq/meeting-notes")({
  head: () => ({ meta: [{ title: "Meeting Notes — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: MeetingNotesPage,
});

type Note = {
  id: string;
  meeting_id: string | null;
  title: string;
  body: string | null;
  author_id: string;
  meeting_date: string | null;
  tags: string[];
  attendees: string[];
  created_at: string;
  updated_at: string;
};

type Profile = { id: string; full_name: string | null; email: string | null };

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function MeetingNotesPage() {
  const [me, setMe] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [selected, setSelected] = useState<Note | null>(null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Note>>({});

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    setMe(u.user?.id ?? null);
    const { data } = await supabase.from("meeting_notes").select("*").order("meeting_date", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });
    const list = (data ?? []) as Note[];
    setNotes(list);
    const ids = Array.from(new Set(list.map((n) => n.author_id)));
    if (ids.length) {
      const { data: p } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
      const map: Record<string, Profile> = {};
      (p ?? []).forEach((row: any) => { map[row.id] = row; });
      setProfiles(map);
    }
  };
  useEffect(() => { load(); }, []);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [notes]);

  const filtered = useMemo(() => notes.filter((n) => {
    if (tagFilter && !n.tags.includes(tagFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      return `${n.title} ${n.body ?? ""} ${n.tags.join(" ")} ${n.attendees.join(" ")}`.toLowerCase().includes(q);
    }
    return true;
  }), [notes, search, tagFilter]);

  const startNew = () => {
    const now = new Date();
    setDraft({ title: "", body: "", meeting_date: now.toISOString(), tags: [], attendees: [] });
    setSelected(null);
    setEditing(true);
  };

  const startEdit = (n: Note) => {
    setDraft({ ...n });
    setEditing(true);
  };

  const save = async () => {
    if (!me || !draft.title?.trim()) return;
    const payload = {
      title: draft.title!.trim(),
      body: draft.body?.trim() || null,
      meeting_date: draft.meeting_date || null,
      tags: draft.tags ?? [],
      attendees: draft.attendees ?? [],
    };
    if (draft.id) {
      const { data, error } = await supabase.from("meeting_notes").update(payload).eq("id", draft.id).select().single();
      if (error) { alert(error.message); return; }
      setNotes((prev) => prev.map((n) => (n.id === draft.id ? (data as Note) : n)));
      setSelected(data as Note);
    } else {
      const { data, error } = await supabase.from("meeting_notes").insert({ ...payload, author_id: me }).select().single();
      if (error) { alert(error.message); return; }
      setNotes((prev) => [data as Note, ...prev]);
      setSelected(data as Note);
    }
    setEditing(false);
  };

  const remove = async (n: Note) => {
    if (!confirm("Delete this note?")) return;
    await supabase.from("meeting_notes").delete().eq("id", n.id);
    setNotes((prev) => prev.filter((x) => x.id !== n.id));
    if (selected?.id === n.id) setSelected(null);
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl gap-4 px-4 py-6">
      <aside className="flex w-80 shrink-0 flex-col rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Notes</h2>
            </div>
            <button onClick={startNew} className="flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-xs text-primary-foreground"><Plus className="h-3 w-3" /> New</button>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes…" className="w-full rounded-md border border-border bg-background pl-7 pr-2 py-1.5 text-xs outline-none focus:border-primary" />
          </div>
          {allTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              <button onClick={() => setTagFilter(null)} className={`rounded-full border px-2 py-0.5 text-[10px] ${tagFilter === null ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}>All</button>
              {allTags.map((t) => (
                <button key={t} onClick={() => setTagFilter(t === tagFilter ? null : t)} className={`rounded-full border px-2 py-0.5 text-[10px] ${tagFilter === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}>{t}</button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">No notes yet.</p>
          ) : filtered.map((n) => (
            <button key={n.id} onClick={() => { setSelected(n); setEditing(false); }} className={`block w-full border-b border-border/50 p-4 text-left transition hover:bg-muted/50 ${selected?.id === n.id ? "bg-primary/10" : ""}`}>
              <p className="line-clamp-1 text-sm font-semibold">{n.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.body || "No content"}</p>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{n.meeting_date ? new Date(n.meeting_date).toLocaleDateString() : new Date(n.created_at).toLocaleDateString()}</span>
                {n.tags.slice(0, 2).map((t) => <span key={t} className="rounded bg-muted px-1.5 py-0.5">{t}</span>)}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex flex-1 flex-col rounded-xl border border-border bg-card">
        {!selected && !editing ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <StickyNote className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p>Select a note or create a new one.</p>
          </div>
        ) : editing ? (
          <NoteEditor draft={draft} setDraft={setDraft} onSave={save} onCancel={() => { setEditing(false); if (!draft.id) setSelected(null); }} />
        ) : selected ? (
          <div className="flex flex-1 flex-col">
            <header className="flex items-start justify-between gap-4 border-b border-border p-5">
              <div>
                <h2 className="text-2xl font-semibold">{selected.title}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {selected.meeting_date && <span>📅 {new Date(selected.meeting_date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>}
                  <span>by {profiles[selected.author_id]?.full_name || profiles[selected.author_id]?.email || "Unknown"}</span>
                  {selected.attendees.length > 0 && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {selected.attendees.join(", ")}</span>}
                </div>
                {selected.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selected.tags.map((t) => <span key={t} className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary"><TagIcon className="h-2.5 w-2.5" />{t}</span>)}
                  </div>
                )}
              </div>
              {selected.author_id === me && (
                <div className="flex gap-2">
                  <button onClick={() => startEdit(selected)} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">Edit</button>
                  <button onClick={() => remove(selected)} className="rounded-lg border border-destructive/30 p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              )}
            </header>
            <div className="flex-1 overflow-y-auto p-6">
              {selected.body ? (
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{selected.body}</pre>
              ) : (
                <p className="text-sm italic text-muted-foreground">No content yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function NoteEditor({ draft, setDraft, onSave, onCancel }: { draft: Partial<Note>; setDraft: (d: Partial<Note>) => void; onSave: () => void; onCancel: () => void }) {
  const [tagInput, setTagInput] = useState("");
  const [attInput, setAttInput] = useState("");

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    setDraft({ ...draft, tags: Array.from(new Set([...(draft.tags ?? []), t])) });
    setTagInput("");
  };
  const addAtt = () => {
    const t = attInput.trim();
    if (!t) return;
    setDraft({ ...draft, attendees: Array.from(new Set([...(draft.attendees ?? []), t])) });
    setAttInput("");
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-semibold">{draft.id ? "Edit note" : "New note"}</h2>
        <div className="flex gap-2">
          <button onClick={onCancel} className="rounded-lg border border-border px-3 py-1.5 text-xs">Cancel</button>
          <button onClick={onSave} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Save</button>
        </div>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <input autoFocus placeholder="Meeting title" value={draft.title ?? ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-lg font-semibold outline-none focus:border-primary" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Meeting date & time</label>
            <input type="datetime-local" value={draft.meeting_date ? toLocalInput(draft.meeting_date) : ""} onChange={(e) => setDraft({ ...draft, meeting_date: e.target.value ? new Date(e.target.value).toISOString() : null })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Attendees</label>
          <div className="mb-2 flex flex-wrap gap-1">
            {(draft.attendees ?? []).map((a) => (
              <span key={a} className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                {a}
                <button onClick={() => setDraft({ ...draft, attendees: (draft.attendees ?? []).filter((x) => x !== a) })}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={attInput} onChange={(e) => setAttInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAtt(); } }} placeholder="Add attendee name…" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <button onClick={addAtt} className="rounded-lg border border-border px-3 text-sm hover:bg-muted">Add</button>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Tags</label>
          <div className="mb-2 flex flex-wrap gap-1">
            {(draft.tags ?? []).map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {t}
                <button onClick={() => setDraft({ ...draft, tags: (draft.tags ?? []).filter((x) => x !== t) })}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Add tag…" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <button onClick={addTag} className="rounded-lg border border-border px-3 text-sm hover:bg-muted">Add</button>
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-xs uppercase tracking-wider text-muted-foreground">Notes</label>
            <TranscribeButton onText={(t) => setDraft({ ...draft, body: `${draft.body ?? ""}${draft.body ? "\n" : ""}${t}` })} />
          </div>
          <textarea value={draft.body ?? ""} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={16} placeholder={`# Agenda\n- \n\n# Decisions\n- \n\n# Action items\n- [ ] `} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary" />
        </div>
      </div>
    </div>
  );
}

function TranscribeButton({ onText }: { onText: (t: string) => void }) {
  const [rec, setRec] = useState(false);
  const recRef = useRef<any>(null);

  const toggle = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Live transcription isn't supported in this browser. Try Chrome or Edge."); return; }
    if (rec) {
      try { recRef.current?.stop(); } catch {}
      recRef.current = null;
      setRec(false);
      return;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = false;
    r.lang = "en-US";
    r.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          const text = e.results[i][0].transcript.trim();
          if (text) onText(text);
        }
      }
    };
    r.onend = () => { if (recRef.current === r) { try { r.start(); } catch {} } };
    r.onerror = () => {};
    recRef.current = r;
    try { r.start(); setRec(true); } catch (err: any) { alert(err.message); }
  };

  return (
    <button type="button" onClick={toggle} className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition ${rec ? "border-destructive bg-destructive/10 text-destructive" : "border-border hover:bg-muted"}`}>
      {rec ? <><Square className="h-3 w-3" /> Stop</> : <><Mic className="h-3 w-3" /> Record & transcribe</>}
    </button>
  );
}
