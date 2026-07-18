import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Hash, Lock, Plus, X, Trash2, Search, Settings, ChevronDown, ChevronRight, Folder, Pencil, Check, Reply, CornerDownRight, Phone, Video } from "lucide-react";
import { MessageReactions } from "@/components/hq/MessageReactions";
import { MessageComposer, type Attachment } from "@/components/hq/MessageComposer";
import { MessageBody } from "@/components/hq/MessageBody";
import { ProfilePopover } from "@/components/hq/ProfilePopover";
import { ChannelAccessDialog } from "@/components/hq/ChannelAccessDialog";
import { loadMyPermissions, type Permissions } from "@/lib/hq/permissions";
import { usePhone } from "@/lib/hq/phone";
import { createInstantMeeting } from "@/lib/hq/instant-meeting";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_hq/channels")({
  head: () => ({ meta: [{ title: "Channels — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: ChannelsPage,
});

type Category = { id: string; name: string; position: number };
type Channel = { id: string; name: string; description: string | null; is_private: boolean; created_by: string; created_at: string; category_id: string | null; position: number };
type ChannelMessage = {
  id: string; channel_id: string; author_id: string; body: string; created_at: string;
  edited_at: string | null; deleted_at: string | null; attachments: Attachment[]; reply_to_id: string | null;
};
type Profile = { id: string; full_name: string | null; email: string | null; department: string | null };

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}
function dayLabel(iso: string) {
  const d = new Date(iso); const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const y = new Date(now.getTime() - 86400000);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function ChannelsPage() {
  const { startCall, active: activeCall, channelCall, startChannelCall, joinChannelCall, leaveChannelCall } = usePhone();
  const [callParticipants, setCallParticipants] = useState<string[]>([]);
  const navigate = useNavigate();
  const [me, setMe] = useState<string | null>(null);
  const [perms, setPerms] = useState<Permissions>({ manage_channels: false, manage_roles: false, manage_messages: false, admin: false });
  const [categories, setCategories] = useState<Category[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newChan, setNewChan] = useState({ name: "", description: "", is_private: false, category_id: "" });
  const [showNewCat, setShowNewCat] = useState(false);
  const [catName, setCatName] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editingMsg, setEditingMsg] = useState<{ id: string; body: string } | null>(null);
  const [openProfile, setOpenProfile] = useState<{ userId: string; x: number; y: number } | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChannelMessage | null>(null);
  const [showAccess, setShowAccess] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const msgRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setMe(u.user.id);
      setPerms(await loadMyPermissions(u.user.id));
      const [{ data: cats }, { data: chs }] = await Promise.all([
        supabase.from("channel_categories").select("*").order("position").order("name"),
        supabase.from("channels").select("*").order("position").order("created_at"),
      ]);
      setCategories((cats ?? []) as Category[]);
      const list = (chs ?? []) as Channel[];
      setChannels(list);
      if (list.length && !active) setActive(list[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!active) return;
    (async () => {
      const { data } = await supabase.from("channel_messages").select("*").eq("channel_id", active).order("created_at", { ascending: true });
      const msgs = (data ?? []) as any as ChannelMessage[];
      setMessages(msgs);
      const authorIds = Array.from(new Set(msgs.map((m) => m.author_id)));
      if (authorIds.length) {
        const { data: p } = await supabase.from("profiles").select("id, full_name, email, department").in("id", authorIds);
        const map: Record<string, Profile> = {};
        (p ?? []).forEach((row: any) => { map[row.id] = row; });
        setProfiles((prev) => ({ ...prev, ...map }));
      }
    })();
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const ch = supabase
      .channel(`chm-${active}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "channel_messages", filter: `channel_id=eq.${active}` }, (payload) => {
        const m = payload.new as any as ChannelMessage;
        setMessages((prev) => {
          if (prev.some((x) => x.id === m.id)) return prev;
          const idx = prev.findIndex((x) => x.id.startsWith("tmp-") && x.author_id === m.author_id && x.body === m.body);
          if (idx >= 0) { const next = prev.slice(); next[idx] = m; return next; }
          return [...prev, m];
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "channel_messages", filter: `channel_id=eq.${active}` }, (payload) => {
        const m = payload.new as any as ChannelMessage;
        setMessages((prev) => prev.map((x) => x.id === m.id ? m : x));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "channel_messages", filter: `channel_id=eq.${active}` }, (payload) => {
        const id = (payload.old as any).id as string;
        setMessages((prev) => prev.filter((m) => m.id !== id));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  // Subscribe to channel call presence for the active channel
  useEffect(() => {
    if (!active) { setCallParticipants([]); return; }
    const ch = supabase.channel(`channel-call:${active}`, { config: { presence: { key: `viewer-${Math.random().toString(36).slice(2)}` } } });
    const sync = () => {
      const state = ch.presenceState() as Record<string, any[]>;
      const ids = Object.values(state).flat().map((p: any) => p.user_id).filter(Boolean);
      setCallParticipants(Array.from(new Set(ids)));
    };
    ch.on("presence", { event: "sync" }, sync)
      .on("presence", { event: "join" }, sync)
      .on("presence", { event: "leave" }, sync)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active]);

  const activeChannel = useMemo(() => channels.find((c) => c.id === active), [channels, active]);

  const ensureProfile = async (uid: string) => {
    if (profiles[uid]) return;
    const { data } = await supabase.from("profiles").select("id, full_name, email, department").eq("id", uid).maybeSingle();
    if (data) setProfiles((prev) => ({ ...prev, [uid]: data as Profile }));
  };

  const send = async (body: string, attachments: Attachment[], mentions: string[]) => {
    if ((!body && attachments.length === 0) || !me || !active) return;
    const tempId = `tmp-${crypto.randomUUID()}`;
    const replyId = replyingTo?.id && !replyingTo.id.startsWith("tmp-") ? replyingTo.id : null;
    const optimistic: ChannelMessage = { id: tempId, channel_id: active, author_id: me, body, created_at: new Date().toISOString(), edited_at: null, deleted_at: null, attachments, reply_to_id: replyId };
    setMessages((prev) => [...prev, optimistic]);
    setReplyingTo(null);
    await ensureProfile(me);
    const { data, error } = await supabase.from("channel_messages").insert({ channel_id: active, author_id: me, body, attachments: attachments as any, reply_to_id: replyId, mentions } as any).select().single();
    if (error) { setMessages((prev) => prev.filter((m) => m.id !== tempId)); alert(error.message); return; }
    if (data) setMessages((prev) => prev.map((m) => m.id === tempId ? (data as any as ChannelMessage) : m));
  };

  const scrollToMessage = (mid: string) => {
    const el = msgRefs.current[mid];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-primary");
    setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 1200);
  };

  const softDeleteMsg = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const stamp = new Date().toISOString();
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, deleted_at: stamp, body: "", attachments: [] } : m));
    await supabase.from("channel_messages").update({ deleted_at: stamp, body: "", attachments: [] as any } as any).eq("id", id);
  };

  const saveEdit = async () => {
    if (!editingMsg) return;
    const stamp = new Date().toISOString();
    const body = editingMsg.body.trim();
    setMessages((prev) => prev.map((m) => m.id === editingMsg.id ? { ...m, body, edited_at: stamp } : m));
    setEditingMsg(null);
    await supabase.from("channel_messages").update({ body, edited_at: stamp } as any).eq("id", editingMsg.id);
  };

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const { data } = await supabase.from("channel_categories").insert({ name: catName.trim(), position: categories.length } as any).select().single();
    if (data) setCategories((prev) => [...prev, data as Category]);
    setCatName(""); setShowNewCat(false);
  };

  const createChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me || !newChan.name.trim()) return;
    const { data, error } = await supabase.from("channels").insert({
      name: newChan.name.trim().toLowerCase().replace(/\s+/g, "-"),
      description: newChan.description.trim() || null,
      is_private: newChan.is_private,
      created_by: me,
      category_id: newChan.category_id || null,
      position: channels.length,
    } as any).select().single();
    if (error) { alert(error.message); return; }
    if (data) {
      await supabase.from("channel_members").insert({ channel_id: data.id, user_id: me });
      setChannels((prev) => [...prev, data as Channel]);
      setActive(data.id);
    }
    setNewChan({ name: "", description: "", is_private: false, category_id: "" });
    setShowNew(false);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category? Channels in it will be unfiled.")) return;
    await supabase.from("channel_categories").delete().eq("id", id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setChannels((prev) => prev.map((c) => c.category_id === id ? { ...c, category_id: null } : c));
  };

  // Group channels by category with filter
  const filterMatch = (c: Channel) => c.name.toLowerCase().includes(search.toLowerCase());
  const uncategorized = channels.filter((c) => !c.category_id && filterMatch(c));
  const byCategory = new Map<string, Channel[]>();
  channels.forEach((c) => {
    if (c.category_id && filterMatch(c)) {
      const arr = byCategory.get(c.category_id) ?? [];
      arr.push(c);
      byCategory.set(c.category_id, arr);
    }
  });

  const rendered = useMemo(() => {
    const out: Array<
      | { kind: "day"; key: string; label: string }
      | { kind: "msg"; key: string; m: ChannelMessage; showHeader: boolean }
    > = [];
    let lastDay = ""; let lastAuthor = ""; let lastTs = 0;
    for (const m of messages) {
      const day = new Date(m.created_at).toDateString();
      if (day !== lastDay) { out.push({ kind: "day", key: `d-${day}`, label: dayLabel(m.created_at) }); lastDay = day; lastAuthor = ""; lastTs = 0; }
      const ts = new Date(m.created_at).getTime();
      const showHeader = m.author_id !== lastAuthor || ts - lastTs > 5 * 60 * 1000;
      out.push({ kind: "msg", key: m.id, m, showHeader });
      lastAuthor = m.author_id; lastTs = ts;
    }
    return out;
  }, [messages]);

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl gap-4 px-4 py-6">
      <aside className="flex w-64 shrink-0 flex-col rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Channels</h2>
          </div>
          {perms.manage_channels && (
            <div className="flex gap-1">
              <button onClick={() => setShowNewCat(true)} className="rounded p-1 hover:bg-muted" aria-label="New category" title="New category"><Folder className="h-3.5 w-3.5" /></button>
              <button onClick={() => setShowNew(true)} className="rounded p-1 hover:bg-muted" aria-label="New channel" title="New channel"><Plus className="h-4 w-4" /></button>
            </div>
          )}
        </div>
        <div className="border-b border-border p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter…" className="w-full rounded-md border border-border bg-background pl-6 pr-2 py-1 text-xs outline-none focus:border-primary" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {categories.map((cat) => {
            const chs = byCategory.get(cat.id) ?? [];
            if (chs.length === 0 && search) return null;
            const isCollapsed = collapsed[cat.id];
            return (
              <div key={cat.id} className="mb-2">
                <div className="group flex items-center justify-between px-1">
                  <button onClick={() => setCollapsed((c) => ({ ...c, [cat.id]: !c[cat.id] }))} className="flex flex-1 items-center gap-1 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {cat.name}
                  </button>
                  {perms.manage_channels && (
                    <button onClick={() => deleteCategory(cat.id)} className="rounded p-0.5 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100" aria-label="Delete category"><Trash2 className="h-3 w-3" /></button>
                  )}
                </div>
                {!isCollapsed && chs.map((c) => (
                  <button key={c.id} onClick={() => setActive(c.id)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-muted ${active === c.id ? "bg-primary/10 text-primary" : ""}`}>
                    {c.is_private ? <Lock className="h-3.5 w-3.5" /> : <Hash className="h-3.5 w-3.5" />}
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            );
          })}
          {uncategorized.length > 0 && (
            <div className="mb-2">
              {categories.length > 0 && <p className="px-1 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Uncategorized</p>}
              {uncategorized.map((c) => (
                <button key={c.id} onClick={() => setActive(c.id)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-muted ${active === c.id ? "bg-primary/10 text-primary" : ""}`}>
                  {c.is_private ? <Lock className="h-3.5 w-3.5" /> : <Hash className="h-3.5 w-3.5" />}
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          )}
          {channels.length === 0 && (
            <p className="p-2 text-xs text-muted-foreground">{perms.manage_channels ? "No channels yet. Create one above." : "No channels yet. Ask an admin to create one."}</p>
          )}
        </div>
      </aside>

      <section className="flex flex-1 flex-col rounded-xl border border-border bg-card">
        {!activeChannel ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Select a channel.</div>
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
              <div className="flex items-center gap-1">
                {(() => {
                  const inThisCall = channelCall?.channelId === activeChannel.id;
                  const otherCallActive = !!channelCall && !inThisCall;
                  const hasCall = callParticipants.length > 0;
                  if (inThisCall) {
                    return (
                      <button onClick={() => leaveChannelCall()} title="Leave channel call" className="flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600">
                        <Phone className="h-3 w-3" /> Leave · {callParticipants.length}
                      </button>
                    );
                  }
                  if (hasCall) {
                    return (
                      <button onClick={() => joinChannelCall(activeChannel.id, activeChannel.name)} disabled={otherCallActive} title="Join channel call" className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Join · {callParticipants.length}
                      </button>
                    );
                  }
                  return (
                    <button
                      onClick={() => startChannelCall(activeChannel.id, activeChannel.name)}
                      disabled={otherCallActive}
                      title="Start channel call"
                      className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
                    >
                      <Phone className="h-3 w-3" /> Call
                    </button>
                  );
                })()}
                <button
                  onClick={async () => {
                    const { data: mem } = await supabase.from("channel_members").select("user_id").eq("channel_id", activeChannel.id);
                    const ids = (mem ?? []).map((x: any) => x.user_id);
                    const id = await createInstantMeeting(`#${activeChannel.name} meeting`, ids);
                    if (id) navigate({ to: "/meeting/$id", params: { id } });
                  }}
                  title="Start meeting"
                  className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted"
                >
                  <Video className="h-3 w-3" /> Meeting
                </button>
                {perms.manage_channels && activeChannel.is_private && (
                  <button onClick={() => setShowAccess(true)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted" title="Manage access">
                    <Settings className="h-3.5 w-3.5" /> Access
                  </button>
                )}
              </div>
            </header>
            {callParticipants.length > 0 && channelCall?.channelId !== activeChannel.id && (
              <div className="flex items-center justify-between gap-2 border-b border-emerald-500/30 bg-emerald-500/10 px-5 py-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">Active call</span>
                  <span className="text-muted-foreground">· {callParticipants.length} {callParticipants.length === 1 ? "person" : "people"} in call</span>
                </div>
                <button onClick={() => joinChannelCall(activeChannel.id, activeChannel.name)} disabled={!!channelCall} className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50">
                  Join
                </button>
              </div>
            )}
            <div ref={scrollRef} className="flex-1 space-y-1 overflow-y-auto px-5 py-4">
              {messages.length === 0 && <p className="mt-8 text-center text-sm text-muted-foreground">No messages yet in #{activeChannel.name}.</p>}
              {rendered.map((r) => {
                if (r.kind === "day") return (
                  <div key={r.key} className="my-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{r.label}</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                );
                const m = r.m;
                const p = profiles[m.author_id];
                const name = p?.full_name || p?.email || "Someone";
                const canEdit = m.author_id === me;
                const canDelete = m.author_id === me || perms.manage_messages;
                const optimistic = m.id.startsWith("tmp-");
                const isDeleted = !!m.deleted_at;
                const parent = m.reply_to_id ? messages.find((x) => x.id === m.reply_to_id) : null;
                const parentAuthor = parent ? profiles[parent.author_id] : null;
                const parentName = parentAuthor?.full_name || parentAuthor?.email || "Someone";
                return (
                  <div key={r.key} ref={(el) => { msgRefs.current[m.id] = el; }} className={`group relative flex gap-3 rounded px-2 py-0.5 transition hover:bg-muted/30 ${r.showHeader ? "mt-3" : ""}`}>
                    {r.showHeader ? (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{initials(name)}</div>
                    ) : (
                      <div className="w-8 shrink-0 pt-1 text-right text-[9px] text-transparent group-hover:text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    )}
                    <div className="min-w-0 flex-1">
                      {parent && (
                        <button onClick={() => scrollToMessage(parent.id)} className="mb-0.5 flex max-w-full items-center gap-1 truncate text-[11px] text-muted-foreground hover:text-primary">
                          <CornerDownRight className="h-3 w-3 shrink-0" />
                          <span className="font-semibold">{parentName}</span>
                          <span className="truncate">{parent.deleted_at ? "message deleted" : (parent.body || "attachment")}</span>
                        </button>
                      )}
                      {r.showHeader && (
                        <div className="flex items-baseline gap-2">
                          <button onClick={(e) => setOpenProfile({ userId: m.author_id, x: e.clientX, y: e.clientY })} className="text-sm font-semibold hover:underline">{name}</button>
                          {p?.department && <span className="text-[10px] text-muted-foreground">{p.department}</span>}
                          <span className="text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          {optimistic && <span className="text-[10px] italic text-muted-foreground">sending…</span>}
                        </div>
                      )}
                      {editingMsg?.id === m.id ? (
                        <div className="mt-1 flex items-center gap-2">
                          <input autoFocus value={editingMsg.body} onChange={(e) => setEditingMsg({ ...editingMsg, body: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingMsg(null); }} className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary" />
                          <button onClick={saveEdit} className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground"><Check className="h-3 w-3" /></button>
                          <button onClick={() => setEditingMsg(null)} className="rounded border border-border px-2 py-1 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <>
                          <div className={optimistic ? "opacity-70" : ""}>
                            <MessageBody body={m.body} attachments={m.attachments} deleted={isDeleted} currentUserId={me ?? undefined} />
                          </div>
                          {m.edited_at && !isDeleted && <span className="text-[10px] text-muted-foreground">(edited)</span>}
                          {!optimistic && !isDeleted && <MessageReactions messageType="channel" messageId={m.id} me={me} />}
                        </>
                      )}
                    </div>
                    {!optimistic && !isDeleted && editingMsg?.id !== m.id && (
                      <div className="absolute right-2 top-0 hidden gap-1 rounded-md border border-border bg-card p-0.5 shadow-sm group-hover:flex">
                        <button onClick={() => setReplyingTo(m)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Reply"><Reply className="h-3 w-3" /></button>
                        {canEdit && <button onClick={() => setEditingMsg({ id: m.id, body: m.body })} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Edit"><Pencil className="h-3 w-3" /></button>}
                        {canDelete && <button onClick={() => softDeleteMsg(m.id)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete"><Trash2 className="h-3 w-3" /></button>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {me && <MessageComposer userId={me} onSend={send} placeholder={`Message #${activeChannel.name}…`} replyTo={replyingTo ? { name: profiles[replyingTo.author_id]?.full_name || profiles[replyingTo.author_id]?.email || "Someone", body: replyingTo.body, deleted: !!replyingTo.deleted_at } : null} onCancelReply={() => setReplyingTo(null)} />}
          </>
        )}
      </section>

      {showNewCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowNewCat(false)}>
          <form onSubmit={createCategory} className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">New category</h3>
              <button type="button" onClick={() => setShowNewCat(false)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <input autoFocus required value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Engineering" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShowNewCat(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Create</button>
            </div>
          </form>
        </div>
      )}

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
                <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Category</label>
                <select value={newChan.category_id} onChange={(e) => setNewChan({ ...newChan, category_id: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="">— None —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
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

      {openProfile && <ProfilePopover userId={openProfile.userId} anchor={{ x: openProfile.x, y: openProfile.y }} onClose={() => setOpenProfile(null)} />}
      {showAccess && activeChannel && <ChannelAccessDialog channelId={activeChannel.id} channelName={activeChannel.name} onClose={() => setShowAccess(false)} />}
    </div>
  );
}
