import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone } from "lucide-react";

export const Route = createFileRoute("/_hq/announcements")({
  head: () => ({ meta: [{ title: "Announcements — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: AnnouncementsPage,
});

type A = { id: string; title: string; body: string | null; published_at: string; author_id: string | null };

function AnnouncementsPage() {
  const [items, setItems] = useState<A[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("announcements").select("*").order("published_at", { ascending: false });
    setItems((data ?? []) as A[]);
  };

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
        const rs = (roles ?? []).map((r: any) => r.role);
        setIsAdmin(rs.includes("super_admin") || rs.includes("admin"));
      }
      load();
    })();
  }, []);

  const post = async () => {
    if (!title.trim()) return;
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("announcements").insert({ title, body, author_id: u.user?.id });
    if (error) { setMsg(error.message); return; }
    setTitle(""); setBody(""); setMsg("Posted.");
    load();
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Megaphone className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-semibold">Announcements</h1>
      </div>

      {isAdmin && (
        <div className="mb-8 rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">New announcement</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Body (optional)"
            rows={3}
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <div className="mt-3 flex items-center gap-3">
            <button onClick={post} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Post</button>
            {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No announcements yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id} className="rounded-xl border border-border bg-card p-5">
              <p className="text-lg font-semibold">{a.title}</p>
              {a.body && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{a.body}</p>}
              <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                {new Date(a.published_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
