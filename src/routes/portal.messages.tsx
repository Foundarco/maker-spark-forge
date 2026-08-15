import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";

type Row = Record<string, any>;

function PortalMessages() {
  const { portal } = Route.useRouteContext();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("con_client_messages")
      .select("*")
      .eq("client_id", portal.clientId)
      .order("created_at", { ascending: true });
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`portal-msgs-${portal.clientId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "con_client_messages", filter: `client_id=eq.${portal.clientId}` }, (p) => {
        setRows((prev) => (prev.some((r) => r.id === (p.new as any).id) ? prev : [...prev, p.new as Row]));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portal.clientId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [rows.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    const { data: u } = await supabase.auth.getUser();
    await supabase.from("con_client_messages").insert({
      client_id: portal.clientId,
      body: text,
      author_id: u.user?.id ?? null,
      from_client: true,
    });
    setBody("");
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Talk directly with your project team.</p>
      </header>

      <div className="flex h-[60vh] flex-col rounded-xl border border-border bg-card">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : rows.length === 0 ? (
            <p className="py-16 text-center text-xs text-muted-foreground">No messages yet — say hello.</p>
          ) : rows.map((m) => (
            <div key={m.id} className={`flex ${m.from_client ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${m.from_client ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p className={`mt-1 text-[10px] ${m.from_client ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {m.from_client ? "You" : "Clovr Labs team"} · {new Date(m.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
          <input
            aria-label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a message…"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <button type="submit" disabled={sending || !body.trim()} aria-label="Send message" className="rounded-lg bg-primary p-2 text-primary-foreground disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/portal/messages")({
  head: () => ({ meta: [{ title: "Messages — Client Portal" }, { name: "robots", content: "noindex" }] }),
  component: PortalMessages,
});
