import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Hash, Lock, Plus, Send, Users, X } from "lucide-react";

export const Route = createFileRoute("/_hq/channels")({
  head: () => ({ meta: [{ title: "Channels — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: ChannelsPage,
});

type Channel = { id: string; name: string; description: string | null; is_private: boolean; created_by: string; created_at: string };
type ChannelMessage = { id: string; channel_id: string; author_id: string; body: string; created_at: string };
type Profile = { id: string; full_name: string | null; email: string | null };

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function ChannelsPage() {
  const [me, setMe] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [active, setActive] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newChan, setNewChan] = useState({ name: "", description: "", is_private: false });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadChannels = async () => {
    const { data } = await supabase.from("channels").select("*").order("created_at", { ascending: true });
    setChannels((data ?? []) as Channel[]);
    if (!active && data && data.length) setActive(data[0].id);
  };

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (u.user) setMe(u.user.id);
      await loadChannels();
    })();
  }, []);

  useEffect(() => {
    if (!active) return;
    (async () => {
      const { data } = await supabase.from("channel_messages").select("*").eq("channel_id", active).order("created_at", { ascending: true });
      const msgs = (data ?? []) as ChannelMessage[];
      setMessages(msgs);
      const authorIds = Array.from(new Set(msgs.map((m) => m.author_id)));
      if (authorIds.length) {
        const { data: p } = await supabase.from("profiles").select("id, full_name, email").in("id", authorIds);
        const map: Record<string, Profile> = {};
        (p ?? []).forEach((row: any) => { map[row.id] = row; });
        setProfiles((prev) => ({ ...prev, ...map }));
      }
      inputRef.current?.focus();
    })();
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const ch = supabase
      .channel(`chm-${active}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "channel_messages", filter: `channel_id=eq.${active}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChannelMessage]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const activeChannel = useMemo(() => channels.find((c) => c.id === active), [channels, active]);

  const send = async () => {
    if (!input.trim() || !me || !active) return;
    const body = input.trim();
    setInput("");
    const { error } = await supabase.from("channel_messages").insert({ channel_id: active, author_id: me, body });
    if (error) alert(error.message);
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
        <div className="flex-1 overflow-y-auto p-2">
          {channels.length === 0 && <p className="p-2 text-xs text-muted-foreground">No channels yet. Create one to get started.</p>}
          {channels.map((c) => (
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
                </div>
                {activeChannel.description && <p className="mt-0.5 text-xs text-muted-foreground">{activeChannel.description}</p>}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {new Set(messages.map((m) => m.author_id)).size} active
              </div>
            </header>
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {messages.length === 0 && <p className="text-center text-sm text-muted-foreground">No messages yet in #{activeChannel.name}. Start the conversation.</p>}
              {messages.map((m) => {
                const p = profiles[m.author_id];
                const name = p?.full_name || p?.email || "Someone";
                return (
                  <div key={m.id} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{initials(name)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold">{name}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{m.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-border p-3">
              <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2">
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
