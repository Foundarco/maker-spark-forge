import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Smile } from "lucide-react";

type Reaction = { id: string; message_type: string; message_id: string; user_id: string; emoji: string };

const QUICK = ["👍", "❤️", "😄", "🎉", "✅", "👀", "🔥", "🙏"];

export function MessageReactions({
  messageType,
  messageId,
  me,
}: {
  messageType: "channel" | "dm";
  messageId: string;
  me: string | null;
}) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (messageId.startsWith("tmp-")) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("message_reactions")
        .select("*")
        .eq("message_type", messageType)
        .eq("message_id", messageId);
      if (!cancelled) setReactions((data ?? []) as Reaction[]);
    })();
    const ch = supabase
      .channel(`rx-${messageType}-${messageId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "message_reactions", filter: `message_id=eq.${messageId}` }, (payload) => {
        if (payload.eventType === "INSERT") {
          const r = payload.new as Reaction;
          if (r.message_type !== messageType) return;
          setReactions((prev) => (prev.some((x) => x.id === r.id) ? prev : [...prev, r]));
        } else if (payload.eventType === "DELETE") {
          const r = payload.old as Reaction;
          setReactions((prev) => prev.filter((x) => x.id !== r.id));
        }
      })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [messageType, messageId]);

  const toggle = async (emoji: string) => {
    if (!me || messageId.startsWith("tmp-")) return;
    setOpen(false);
    const mine = reactions.find((r) => r.user_id === me && r.emoji === emoji);
    if (mine) {
      setReactions((prev) => prev.filter((r) => r.id !== mine.id));
      await supabase.from("message_reactions").delete().eq("id", mine.id);
    } else {
      const optimistic: Reaction = { id: `tmp-${crypto.randomUUID()}`, message_type: messageType, message_id: messageId, user_id: me, emoji };
      setReactions((prev) => [...prev, optimistic]);
      const { data } = await supabase.from("message_reactions").insert({ message_type: messageType, message_id: messageId, user_id: me, emoji }).select().single();
      if (data) setReactions((prev) => prev.map((r) => (r.id === optimistic.id ? (data as Reaction) : r)));
    }
  };

  // Group by emoji
  const groups = new Map<string, Reaction[]>();
  reactions.forEach((r) => {
    const arr = groups.get(r.emoji) ?? [];
    arr.push(r);
    groups.set(r.emoji, arr);
  });

  return (
    <div className="relative mt-0.5 flex flex-wrap items-center gap-1">
      {Array.from(groups.entries()).map(([emoji, list]) => {
        const mine = me ? list.some((r) => r.user_id === me) : false;
        return (
          <button
            key={emoji}
            onClick={() => toggle(emoji)}
            className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] transition ${
              mine ? "border-primary/60 bg-primary/10 text-primary" : "border-border bg-muted/40 hover:bg-muted"
            }`}
          >
            <span>{emoji}</span>
            <span>{list.length}</span>
          </button>
        );
      })}
      <button
        onClick={() => setOpen((s) => !s)}
        className="rounded-full p-0.5 text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
        aria-label="Add reaction"
      >
        <Smile className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 flex gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg">
          {QUICK.map((e) => (
            <button key={e} onClick={() => toggle(e)} className="rounded p-1 text-lg hover:bg-muted" title={`React ${e}`}>{e}</button>
          ))}
        </div>
      )}
    </div>
  );
}
