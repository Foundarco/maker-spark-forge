import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, Factory, ShoppingCart, DollarSign, ArrowUpRight, Megaphone, Activity } from "lucide-react";

export const Route = createFileRoute("/_hq/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

type Announcement = { id: string; title: string; body: string | null; published_at: string };
type Activity = { id: string; module: string; action: string; entity_type: string | null; created_at: string };

function Dashboard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { data: p } = await supabase.from("profiles").select("full_name").eq("id", user.user.id).maybeSingle();
        setDisplayName(p?.full_name || user.user.email || "");
      }
      const { data: ann } = await supabase.from("announcements").select("*").order("published_at", { ascending: false }).limit(5);
      if (ann) setAnnouncements(ann as Announcement[]);
      const { data: act } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(10);
      if (act) setActivity(act as Activity[]);
    })();
  }, []);

  const kpis = [
    { label: "Team members", value: "—", icon: Users, hint: "Invite from Admin → Users" },
    { label: "Production", value: "—", icon: Factory, hint: "Module scaffolded" },
    { label: "Open orders", value: "—", icon: ShoppingCart, hint: "Module scaffolded" },
    { label: "Revenue MTD", value: "—", icon: DollarSign, hint: "Module scaffolded" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back{displayName ? `, ${displayName.split(" ")[0]}` : ""}</h1>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{k.label}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-3xl font-semibold">{k.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Recent activity</h2>
            </div>
            <Link to="/timeline" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          {activity.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No activity yet. As you and your team use HQ, actions across modules will appear here.
            </p>
          ) : (
            <ul className="space-y-3">
              {activity.map((a) => (
                <li key={a.id} className="flex items-center gap-3 text-sm">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{a.module}</span>
                  <span>{a.action}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Announcements</h2>
            </div>
            <Link to="/announcements" className="text-xs text-primary hover:underline">All →</Link>
          </div>
          {announcements.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No announcements yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {announcements.map((a) => (
                <li key={a.id}>
                  <p className="text-sm font-semibold">{a.title}</p>
                  {a.body && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.body}</p>}
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {new Date(a.published_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
        <div className="flex items-start gap-4">
          <ArrowUpRight className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Clovr HQ is scaffolded</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Every module from the roadmap is available in the sidebar. Most are placeholders — click any to see what's coming.
              Tell the assistant (bottom right) what to build next.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
