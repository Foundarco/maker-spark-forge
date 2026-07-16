import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Hash, Lock, Plus, Send, Users, X, Trash2, Search, Pencil } from "lucide-react";
import { MessageReactions } from "@/components/hq/MessageReactions";

export const Route = createFileRoute("/_hq/channels")({
  head: () => ({ meta: [{ title: "Channels — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: ChannelsPage,
});

type Channel = { id: string; name: string; description: string | null; is_private: boolean; created_by: string; created_at: string };
type ChannelMessage = { id: string; channel_id: string; author_id: string; body: string; created_at: string };
type Profile = { id: string; full_name: string | null; email: string | null; department: string | null };

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function isSameDay(a: string, b: string) {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (isSameDay(iso, now.toISOString())) return "Today";
  if (diff <= 1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function ChannelsPage() {
  const [me, setMe] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [active, setActive] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newChan, setNewChan] = useState({ name: "", description: "", is_private: false });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (u.user) setMe(u.user.id);
      const { data } = await supabase.from("channels").select("*").order("created_at", { ascending: true });
      const list = (data ?? []) as Channel[];
      setChannels(list);
      if (list.length && !active) setActive(list[0].id);
    })();
  }, []);

  // Load messages for active channel
  useEffect(() => {
    if (!active) return;
    (async () => {
      const { data } = await supabase.from("channel_messages").select("*").eq("channel_id", active).order("created_at", { ascending: true });
      const msgs = (data ?? []) as ChannelMessage[];
      setMessages(msgs);
      const authorIds = Array.from(new Set(msgs.map((m) => m.author_id)));
      if (authorIds.length) {
        const { data: p } = await supabase.from("profiles").select("id, full_name, email, department").in("id", authorIds);
        const map: Record<string, Profile> = {};
        (p ?? []).forEach((row: any) => { map[row.id] = row; });
        setProfiles((prev) => ({ ...prev, ...map }));
      }
      inputRef.current?.focus();
    })();
  }, [active]);

  // Realtime for the active channel — dedupe against optimistic inserts
  useEffect(() => {
    if (!active) return;
    const ch = supabase
      .channel(`chm-${active}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "channel_messages", filter: `channel_id=eq.${active}` }, (payload) => {
        const m = payload.new as ChannelMessage;
        setMessages((prev) => {
          if (prev.some((x) => x.id === m.id)) return prev;
          // Replace optimistic (temp id starts with "tmp-") with matching author+body
          const idx = prev.findIndex((x) => x.id.startsWith("tmp-") && x.author_id === m.author_id && x.body === m.body);
          if (idx >= 0) { const next = prev.slice(); next[idx] = m; return next; }
          return [...prev, m];
        });
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "channel_messages", filter: `channel_id=eq.${active}` }, (payload) => {
        const id = (payload.old as any).id as string;
        setMessages((prev) => prev.filter((m) => m.id !== id));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const activeChannel = useMemo(() => channels.find((c) => c.id === active), [channels, active]);
  const filteredChannels = channels.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const ensureProfile = async (uid: string) => {
    if (profiles[uid]) return;
    const { data } = await supabase.from("profiles").select("id, full_name, email, department").eq("id", uid).maybeSingle();
    if (data) setProfiles((prev) => ({ ...prev, [uid]: data as Profile }));
  };

  const send = async () => {
    if (!input.trim() || !me || !active) return;
    const body = input.trim();
    setInput("");
    const tempId = `tmp-${crypto.randomUUID()}`;
    const optimistic: ChannelMessage = { id: tempId, channel_id: active, author_id: me, body, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    await ensureProfile(me);
    const { data, error } = await supabase.from("channel_messages").insert({ channel_id: active, author_id: me, body }).select().single();
    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert(error.message);
      return;
    }
    if (data) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? (data as ChannelMessage) : m)));
    }
  };

  const removeMsg = async (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    await supabase.from("channel_messages").delete().eq("id", id);
  };

  const createChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me || !newChan.name.trim()) return;
    const { data, error } = await supabase.from("channels").insert({
      name: newChan.name.trim().toLowerCase().replace(/\s+/g, "-"),
      description: newChan.description.trim() || null,
      is_private: newChan.is_private,
      created_by: me,
    }).select().single();
    if (error) { alert(error.message); return; }
    if (data) {
      await supabase.from("channel_members").insert({ channel_id: data.id, user_id: me });
      setChannels((prev) => [...prev, data as Channel]);
      setActive(data.id);
    }
    setNewChan({ name: "", description: "", is_private: false });
    setShowNew(false);
  };

  // Group messages into date sections + collapse consecutive by same author within 5 min
  const rendered = useMemo(() => {
    const out: Array<
      | { kind: "day"; key: string; label: string }
      | { kind: "msg"; key: string; m: ChannelMessage; showHeader: boolean }
    > = [];
    let lastDay = "";
    let lastAuthor = "";
    let lastTs = 0;
    for (const m of messages) {
      const day = new Date(m.created_at).toDateString();
      if (day !== lastDay) {
        out.push({ kind: "day", key: `d-${day}`, label: dayLabel(m.created_at) });
        lastDay = day; lastAuthor = ""; lastTs = 0;
      }
      const ts = new Date(m.created_at).getTime();
      const showHeader = m.author_id !== lastAuthor || ts - lastTs > 5 * 60 * 1000;
      out.push({ kind: "msg", key: m.id, m, showHeader });
      lastAuthor = m.author_id; lastTs = ts;
    }
    return out;
  }, [messages]);

  const activeAuthors = Array.from(new Set(messages.map((m) => m.author_id)));

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl gap-4 px-4 py-6">
      <aside className="flex w-64 shrink-0 flex-col rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Channels</h2>
          </div>
          <button onClick={() => setShowNew(true)} className="rounded p-1 hover:bg-muted" aria-label="New channel"><Plus className="h-4 w-4" /></button>
        </div>
        <div className="border-b border-border p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter…" className="w-full rounded-md border border-border bg-background pl-6 pr-2 py-1 text-xs outline-none focus:border-primary" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filteredChannels.length === 0 && <p className="p-2 text-xs text-muted-foreground">No channels{channels.length ? " match." : " yet. Create one to get started."}</p>}
          {filteredChannels.map((c) => (
            <button key={c.id} onClick={() => setActive(c.id)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-muted ${active === c.id ? "bg-primary/10 text-primary" : ""}`}>
              {c.is_private ? <Lock className="h-3.5 w-3.5" /> : <Hash className="h-3.5 w-3.5" />}
              <span className="truncate">{c.name}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex flex-1 flex-col rounded-xl border border-border bg-card">
        {!activeChannel ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Select or create a channel.</div>
        ) : (
          <>
            <header className="flex items-center justify-between border-b border-border px-5 py-3">
              <div>
                <div className="flex items-center gap-2">
                  {activeChannel.is_private ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                  <h2 className="font-semibold">{activeChannel.name}</h2>
                  {activeChannel.is_private && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Private</span>}
                </div>
                {activeChannel.description && <p className="mt-0.5 text-xs text-muted-foreground">{activeChannel.description}</p>}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{activeAuthors.length} member{activeAuthors.length === 1 ? "" : "s"}</span>
                <span>{messages.length} message{messages.length === 1 ? "" : "s"}</span>
              </div>
            </header>
            <div ref={scrollRef} className="flex-1 space-y-1 overflow-y-auto px-5 py-4">
              {messages.length === 0 && <p className="mt-8 text-center text-sm text-muted-foreground">No messages yet in #{activeChannel.name}. Start the conversation.</p>}
              {rendered.map((r) => {
                if (r.kind === "day") {
                  return (
                    <div key={r.key} className="my-3 flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{r.label}</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  );
                }
                const m = r.m;
                const p = profiles[m.author_id];
                const name = p?.full_name || p?.email || "Someone";
                const isMe = m.author_id === me;
                const optimistic = m.id.startsWith("tmp-");
                return (
                  <div key={r.key} className={`group flex gap-3 rounded px-2 py-0.5 hover:bg-muted/30 ${r.showHeader ? "mt-3" : ""}`}>
                    {r.showHeader ? (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{initials(name)}</div>
                    ) : (
                      <div className="w-8 shrink-0 pt-1 text-right text-[9px] text-transparent group-hover:text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    )}
                    <div className="min-w-0 flex-1">
                      {r.showHeader && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold">{name}</span>
                          {p?.department && <span className="text-[10px] text-muted-foreground">{p.department}</span>}
                          <span className="text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          {optimistic && <span className="text-[10px] italic text-muted-foreground">sending…</span>}
                        </div>
                      )}
                      <p className={`whitespace-pre-wrap text-sm ${optimistic ? "opacity-70" : ""}`}>{m.body}</p>
                      {!optimistic && <MessageReactions messageType="channel" messageId={m.id} me={me} />}
                    </div>
                    {isMe && !optimistic && (
                      <button onClick={() => removeMsg(m.id)} className="hidden shrink-0 rounded p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 sm:block" aria-label="Delete message">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-border p-3">
              <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  rows={1}
                  placeholder={`Message #${activeChannel.name}…`}
                  className="max-h-32 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button type="submit" disabled={!input.trim()} className="rounded-lg bg-primary p-2 text-primary-foreground disabled:opacity-40" aria-label="Send">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 pl-2 text-[10px] text-muted-foreground">Enter to send · Shift + Enter for a new line</p>
            </form>
          </>
        )}
      </section>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowNew(false)}>
          <form onSubmit={createChannel} className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Create channel</h3>
              <button type="button" onClick={() => setShowNew(false)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Name</label>
                <input required autoFocus value={newChan.name} onChange={(e) => setNewChan({ ...newChan, name: e.target.value })} placeholder="e.g. product-launch" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea value={newChan.description} onChange={(e) => setNewChan({ ...newChan, description: e.target.value })} rows={2} placeholder="What's this channel about?" className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={newChan.is_private} onChange={(e) => setNewChan({ ...newChan, is_private: e.target.checked })} />
                Private (invite-only)
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowNew(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
