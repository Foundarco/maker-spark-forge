import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessagesSquare, Search, Send, User as UserIcon, Check, CheckCheck } from "lucide-react";
import { MessageReactions } from "@/components/hq/MessageReactions";

export const Route = createFileRoute("/_hq/dm")({
  head: () => ({ meta: [{ title: "Messages — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: DMPage,
});

type Profile = { id: string; full_name: string | null; email: string | null; department: string | null };
type DM = { id: string; sender_id: string; recipient_id: string; body: string; read_at: string | null; created_at: string };

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const y = new Date(now.getTime() - 86400000);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function DMPage() {
  const [me, setMe] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [messages, setMessages] = useState<DM[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setMe(u.user.id);
      const { data: p } = await supabase.from("profiles").select("id, full_name, email, department").neq("id", u.user.id).order("full_name");
      setProfiles((p ?? []) as Profile[]);
      const { data: dms } = await supabase.from("direct_messages").select("*").or(`sender_id.eq.${u.user.id},recipient_id.eq.${u.user.id}`).order("created_at", { ascending: true });
      setMessages((dms ?? []) as DM[]);
    })();
  }, []);

  useEffect(() => {
    if (!me) return;
    const channel = supabase
      .channel("dm-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, (payload) => {
        const m = payload.new as DM;
        if (m.sender_id !== me && m.recipient_id !== me) return;
        setMessages((prev) => {
          if (prev.some((x) => x.id === m.id)) return prev;
          const idx = prev.findIndex((x) => x.id.startsWith("tmp-") && x.sender_id === m.sender_id && x.recipient_id === m.recipient_id && x.body === m.body);
          if (idx >= 0) { const next = prev.slice(); next[idx] = m; return next; }
          return [...prev, m];
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "direct_messages" }, (payload) => {
        const m = payload.new as DM;
        setMessages((prev) => prev.map((x) => (x.id === m.id ? m : x)));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [me]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, active]);

  useEffect(() => { inputRef.current?.focus(); }, [active]);

  // Mark unread messages from active peer as read
  useEffect(() => {
    if (!me || !active) return;
    const unread = messages.filter((m) => m.sender_id === active && m.recipient_id === me && !m.read_at).map((m) => m.id);
    if (unread.length === 0) return;
    (async () => {
      const stamp = new Date().toISOString();
      await supabase.from("direct_messages").update({ read_at: stamp }).in("id", unread);
      setMessages((prev) => prev.map((m) => (unread.includes(m.id) ? { ...m, read_at: stamp } : m)));
    })();
  }, [me, active, messages]);

  const conversations = useMemo(() => {
    const byUser = new Map<string, { last: DM; unread: number }>();
    for (const m of messages) {
      const other = m.sender_id === me ? m.recipient_id : m.sender_id;
      const prev = byUser.get(other);
      const unread = m.recipient_id === me && !m.read_at ? 1 : 0;
      if (!prev || new Date(m.created_at) > new Date(prev.last.created_at)) {
        byUser.set(other, { last: m, unread: (prev?.unread ?? 0) + unread });
      } else {
        byUser.set(other, { last: prev.last, unread: prev.unread + unread });
      }
    }
    return byUser;
  }, [messages, me]);

  const displayed = profiles.filter((p) => {
    const name = p.full_name || p.email || "";
    return name.toLowerCase().includes(search.toLowerCase()) || (p.department ?? "").toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => {
    const la = conversations.get(a.id)?.last.created_at ?? "";
    const lb = conversations.get(b.id)?.last.created_at ?? "";
    if (la && !lb) return -1;
    if (!la && lb) return 1;
    return lb.localeCompare(la);
  });

  const thread = active ? messages.filter((m) => (m.sender_id === active && m.recipient_id === me) || (m.sender_id === me && m.recipient_id === active)) : [];
  const activeProfile = profiles.find((p) => p.id === active);

  const rendered = useMemo(() => {
    const out: Array<
      | { kind: "day"; key: string; label: string }
      | { kind: "msg"; key: string; m: DM }
    > = [];
    let lastDay = "";
    for (const m of thread) {
      const day = new Date(m.created_at).toDateString();
      if (day !== lastDay) {
        out.push({ kind: "day", key: `d-${day}`, label: dayLabel(m.created_at) });
        lastDay = day;
      }
      out.push({ kind: "msg", key: m.id, m });
    }
    return out;
  }, [thread]);

  const send = async () => {
    if (!input.trim() || !me || !active) return;
    const body = input.trim();
    setInput("");
    const tempId = `tmp-${crypto.randomUUID()}`;
    const optimistic: DM = { id: tempId, sender_id: me, recipient_id: active, body, read_at: null, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    const { data, error } = await supabase.from("direct_messages").insert({ sender_id: me, recipient_id: active, body }).select().single();
    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert(error.message);
      return;
    }
    if (data) setMessages((prev) => prev.map((m) => (m.id === tempId ? (data as DM) : m)));
    inputRef.current?.focus();
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl gap-4 px-4 py-6">
      <aside className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="mb-3 flex items-center gap-2">
            <MessagesSquare className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Messages</h2>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search people…" className="w-full rounded-md border border-border bg-background pl-7 pr-2 py-1.5 text-xs outline-none focus:border-primary" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {displayed.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">No teammates found.</p>
          ) : displayed.map((p) => {
            const conv = conversations.get(p.id);
            const name = p.full_name || p.email || "Unknown";
            const preview = conv?.last.body ?? p.department ?? "Say hi";
            const meSent = conv?.last.sender_id === me;
            return (
              <button key={p.id} onClick={() => setActive(p.id)} className={`flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition hover:bg-muted/50 ${active === p.id ? "bg-primary/10" : ""}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials(name)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{name}</p>
                    {conv?.last && <p className="shrink-0 text-[10px] text-muted-foreground">{new Date(conv.last.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-xs ${conv?.unread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {meSent && "You: "}{preview}
                    </p>
                    {conv?.unread ? <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{conv.unread}</span> : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="flex flex-1 flex-col rounded-xl border border-border bg-card">
        {!active ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <UserIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p>Select a teammate to start messaging.</p>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-border px-5 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {initials(activeProfile?.full_name || activeProfile?.email || "")}
              </div>
              <div>
                <p className="text-sm font-semibold">{activeProfile?.full_name || activeProfile?.email}</p>
                {activeProfile?.department && <p className="text-xs text-muted-foreground">{activeProfile.department}</p>}
              </div>
            </header>
            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
              {thread.length === 0 && <p className="mt-8 text-center text-sm text-muted-foreground">No messages yet. Say hello.</p>}
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
                const mine = m.sender_id === me;
                const optimistic = m.id.startsWith("tmp-");
                return (
                  <div key={r.key} className={`group flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[75%]">
                      <div className={`rounded-2xl px-4 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"} ${optimistic ? "opacity-70" : ""}`}>
                        <p className="whitespace-pre-wrap">{m.body}</p>
                        <p className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          {mine && !optimistic && (m.read_at ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                        </p>
                      </div>
                      {!optimistic && (
                        <div className={mine ? "flex justify-end" : "flex justify-start"}>
                          <MessageReactions messageType="dm" messageId={m.id} me={me} />
                        </div>
                      )}
                    </div>
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
                  placeholder={`Message ${activeProfile?.full_name || "teammate"}…`}
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
    </div>
  );
}
