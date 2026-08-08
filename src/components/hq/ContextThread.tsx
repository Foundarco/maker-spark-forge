import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UserMention } from "@/components/hq/UserMention";

type Msg = {
  id: string;
  body: string;
  author_id: string | null;
  internal: boolean | null;
  created_at: string;
};

type Profile = { id: string; full_name: string | null; email: string | null };

export function ContextThread({ entityType, entityId, title = "Thread" }: { entityType: string; entityId: string; title?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(true);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const [{ data }, { data: p }] = await Promise.all([
      (supabase.from("con_context_messages") as any)
        .select("id, body, author_id, internal, created_at")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: true }),
      supabase.from("profiles").select("id, full_name, email"),
    ]);
    setMsgs((data ?? []) as Msg[]);
    setProfiles((p ?? []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    load();
    const ch = supabase
      .channel(`ctx:${entityType}:${entityId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "con_context_messages", filter: `entity_id=eq.${entityId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  const send = async () => {
    const text = body.trim();
    if (!text) return;
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await (supabase.from("con_context_messages") as any).insert({
      entity_type: entityType,
      entity_id: entityId,
      body: text,
      author_id: user?.id ?? null,
      internal,
    });
    setSending(false);
    if (error) { alert(error.message); return; }
    setBody("");
    load();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
        <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
          Internal only
        </label>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <div className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : msgs.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">No messages yet. Start the conversation.</p>
        ) : (
          msgs.map((m) => {
            const p = profiles.find((x) => x.id === m.author_id);
            return (
              <div key={m.id} className={`rounded-xl border p-3 ${m.internal ? "border-border bg-muted/30" : "border-primary/20 bg-primary-soft/40"}`}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="text-xs font-medium">
                    {m.author_id ? <UserMention userId={m.author_id} name={p?.full_name || p?.email || "User"} /> : "System"}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(m.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    {!m.internal && " · client-visible"}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-foreground">{m.body}</p>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
            placeholder="Write an update… (⌘+Enter to send)"
            className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={send}
            disabled={sending || !body.trim()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Send
          </button>
        </div>
      </div>
    </div>
  );
}
