import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/_hq/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: NotificationsPage,
});

type N = { id: string; title: string; body: string | null; link: string | null; read_at: string | null; created_at: string };

function NotificationsPage() {
  const [items, setItems] = useState<N[]>([]);

  const load = async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
    setItems((data ?? []) as N[]);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    load();
  };
  const markAllRead = async () => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
    load();
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-semibold">Notifications</h1>
        </div>
        <button onClick={markAllRead} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">Mark all read</button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No notifications. When workflows and mentions land in HQ, they'll show up here.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-lg border border-border p-4 ${n.read_at ? "bg-card/40" : "bg-card"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className={`text-sm ${n.read_at ? "text-muted-foreground" : "font-semibold"}`}>{n.title}</p>
                  {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.read_at && (
                  <button onClick={() => markRead(n.id)} className="text-xs text-primary hover:underline">Mark read</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
