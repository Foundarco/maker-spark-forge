import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, Users, TrendingUp, Package, LifeBuoy, DollarSign, Factory,
  Hash, Bell, Calendar, ArrowUpRight, Sparkles, MessageSquare,
} from "lucide-react";
import { UserMention } from "@/components/hq/UserMention";

export const Route = createFileRoute("/_hq/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: DashboardPage,
});

type Team = "growth" | "product" | "operations" | "customer" | "core";

const TEAM_LABEL: Record<Team, string> = {
  growth: "Growth",
  product: "Product",
  operations: "Operations",
  customer: "Customer Service",
  core: "Team",
};

function DashboardPage() {
  const [me, setMe] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [kpis, setKpis] = useState<any>({});
  const [missed, setMissed] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => { (async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    setMe(u.user.id);
    const { data: p } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
    setProfile(p);

    // Roles → teams
    const { data: cr } = await supabase.from("user_custom_roles").select("custom_roles(name, permissions)").eq("user_id", u.user.id);
    const t = new Set<Team>();
    (cr || []).forEach((r: any) => {
      const name = (r.custom_roles?.name || "").toLowerCase();
      if (name.includes("growth") || name.includes("sales") || name.includes("marketing") || name.includes("finance")) t.add("growth");
      if (name.includes("product") || name.includes("engineering") || name.includes("manufacturing") || name.includes("dev")) t.add("product");
      if (name.includes("hr") || name.includes("ops") || name.includes("admin")) t.add("operations");
      if (name.includes("customer") || name.includes("support")) t.add("customer");
    });
    const dept = (p?.department || "").toLowerCase();
    if (dept.includes("growth") || dept.includes("sales") || dept.includes("market") || dept.includes("finance")) t.add("growth");
    if (dept.includes("engineer") || dept.includes("product") || dept.includes("manuf") || dept.includes("dev")) t.add("product");
    if (dept.includes("hr") || dept.includes("ops") || dept.includes("admin")) t.add("operations");
    if (dept.includes("support") || dept.includes("customer")) t.add("customer");
    if (t.size === 0) t.add("core");
    setTeams(Array.from(t));
  })(); }, []);

  useEffect(() => { if (!me) return; (async () => {
    const [deals, tickets, work, invoices, applicants, ideas] = await Promise.all([
      supabase.from("sales_deals").select("id, name, amount, stage, updated_at").order("updated_at", { ascending: false }).limit(50),
      supabase.from("cs_tickets").select("id, status, priority, updated_at").order("updated_at", { ascending: false }).limit(50),
      supabase.from("mfg_work_orders").select("id, status, updated_at").order("updated_at", { ascending: false }).limit(50),
      supabase.from("fin_invoices").select("id, status, total, updated_at").order("updated_at", { ascending: false }).limit(50),
      supabase.from("hr_applicants").select("id, stage, updated_at").order("updated_at", { ascending: false }).limit(50),
      supabase.from("ideas").select("id, title, votes, updated_at").order("updated_at", { ascending: false }).limit(5),
    ]);

    const pipeline = (deals.data || []).filter((d: any) => d.stage !== "won" && d.stage !== "lost").reduce((s: number, d: any) => s + Number(d.amount || 0), 0);
    const won = (deals.data || []).filter((d: any) => d.stage === "won").reduce((s: number, d: any) => s + Number(d.amount || 0), 0);
    const openTickets = (tickets.data || []).filter((t: any) => t.status !== "resolved" && t.status !== "closed").length;
    const openWork = (work.data || []).filter((w: any) => w.status !== "done" && w.status !== "closed").length;
    const outstanding = (invoices.data || []).filter((i: any) => i.status !== "paid").reduce((s: number, i: any) => s + Number(i.total || 0), 0);
    const applicantsOpen = (applicants.data || []).filter((a: any) => a.stage !== "hired" && a.stage !== "rejected").length;

    setKpis({ pipeline, won, openTickets, openWork, outstanding, applicantsOpen, ideas: ideas.data || [] });

    // Missed activity: last 24h channel + DM messages not authored by me
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [chMsgs, dmMsgs] = await Promise.all([
      supabase.from("channel_messages").select("id, channel_id, author_id, body, created_at, mentions").gte("created_at", since).neq("author_id", me).order("created_at", { ascending: false }).limit(20),
      supabase.from("direct_messages").select("id, sender_id, recipient_id, body, created_at").gte("created_at", since).eq("recipient_id", me).order("created_at", { ascending: false }).limit(10),
    ]);
    const feed = [
      ...(chMsgs.data || []).map((m: any) => ({ ...m, _type: "channel" as const })),
      ...(dmMsgs.data || []).map((m: any) => ({ ...m, _type: "dm" as const })),
    ].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 12);
    setMissed(feed);

    // Notifications
    const { data: n } = await supabase.from("notifications").select("*").eq("user_id", me).order("created_at", { ascending: false }).limit(6);
    setNotifs(n || []);

    // Today's meetings
    const now = new Date();
    const end = new Date(); end.setHours(23, 59, 59);
    const { data: mt } = await supabase.from("meetings").select("id, title, starts_at, host_id").gte("starts_at", now.toISOString()).lte("starts_at", end.toISOString()).order("starts_at").limit(5);
    setMeetings(mt || []);

    // Profiles for feed
    const uids = new Set<string>();
    feed.forEach((m: any) => uids.add(m.author_id || m.sender_id));
    (mt || []).forEach((x: any) => uids.add(x.host_id));
    if (uids.size) {
      const { data: pp } = await supabase.from("profiles").select("id, full_name, email").in("id", Array.from(uids));
      const map: Record<string, any> = {};
      (pp || []).forEach((p: any) => { map[p.id] = p; });
      setProfiles(map);
    }
  })(); }, [me]);

  const kpiCards = useMemo(() => {
    const cards: { label: string; value: string; icon: any; to: string; tone: string }[] = [];
    if (teams.includes("growth")) {
      cards.push({ label: "Open pipeline", value: `$${Math.round(kpis.pipeline || 0).toLocaleString()}`, icon: TrendingUp, to: "/pipeline", tone: "text-emerald-600 bg-emerald-500/10" });
      cards.push({ label: "Won this period", value: `$${Math.round(kpis.won || 0).toLocaleString()}`, icon: DollarSign, to: "/sales-analytics", tone: "text-primary bg-primary/10" });
      cards.push({ label: "Outstanding invoices", value: `$${Math.round(kpis.outstanding || 0).toLocaleString()}`, icon: DollarSign, to: "/invoices", tone: "text-amber-600 bg-amber-500/10" });
    }
    if (teams.includes("product")) {
      cards.push({ label: "Open work orders", value: String(kpis.openWork || 0), icon: Factory, to: "/production", tone: "text-blue-600 bg-blue-500/10" });
      cards.push({ label: "Active projects", value: "—", icon: Package, to: "/eng-projects", tone: "text-primary bg-primary/10" });
    }
    if (teams.includes("customer")) {
      cards.push({ label: "Open tickets", value: String(kpis.openTickets || 0), icon: LifeBuoy, to: "/tickets", tone: "text-rose-600 bg-rose-500/10" });
    }
    if (teams.includes("operations")) {
      cards.push({ label: "Open applicants", value: String(kpis.applicantsOpen || 0), icon: Users, to: "/hiring", tone: "text-violet-600 bg-violet-500/10" });
      cards.push({ label: "Team", value: "—", icon: Users, to: "/employees", tone: "text-primary bg-primary/10" });
    }
    if (cards.length === 0) {
      cards.push({ label: "Meetings today", value: String(meetings.length), icon: Calendar, to: "/meetings", tone: "text-primary bg-primary/10" });
      cards.push({ label: "Notifications", value: String(notifs.length), icon: Bell, to: "/notifications", tone: "text-amber-600 bg-amber-500/10" });
    }
    return cards.slice(0, 6);
  }, [teams, kpis, meetings.length, notifs.length]);

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Core · Dashboard</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{greeting}, {firstName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {teams.length > 0 ? `Your ${teams.map((t) => TEAM_LABEL[t]).join(" · ")} snapshot for today.` : "Here's what's happening today."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((k) => (
          <Link key={k.label} to={k.to as any} className="group rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-md">
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${k.tone}`}><k.icon className="h-4 w-4" /></div>
            <p className="mt-3 text-xs text-muted-foreground">{k.label}</p>
            <p className="mt-1 text-xl font-semibold">{k.value}</p>
            <ArrowUpRight className="mt-2 h-3.5 w-3.5 text-muted-foreground transition group-hover:text-primary" />
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Missed activity */}
        <section className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Missed activity</h2>
              <span className="text-xs text-muted-foreground">last 24h</span>
            </div>
            <Link to="/channels" className="text-xs text-primary hover:underline">Open communication →</Link>
          </div>
          <div className="divide-y divide-border">
            {missed.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">All caught up. No new activity in the last 24 hours.</p>
            )}
            {missed.map((m: any) => {
              const uid = m.author_id || m.sender_id;
              const p = profiles[uid];
              const mentioned = Array.isArray(m.mentions) && m.mentions.includes(me);
              return (
                <Link
                  key={`${m._type}-${m.id}`}
                  to={m._type === "channel" ? "/channels" : "/dm"}
                  search={m._type === "dm" ? { user: m.sender_id } as any : undefined}
                  className="flex items-start gap-3 px-5 py-3 hover:bg-muted/40"
                >
                  <div className="mt-0.5">
                    {m._type === "channel" ? <Hash className="h-4 w-4 text-muted-foreground" /> : <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <UserMention userId={uid} name={p?.full_name || p?.email || "Someone"} size="xs" />
                      <span className="text-muted-foreground">{m._type === "channel" ? "in a channel" : "sent you a DM"}</span>
                      {mentioned && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">@you</span>}
                      <span className="ml-auto text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm">{m.body}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Sidebar column */}
        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">Today's meetings</h2></div>
              <Link to="/meetings" className="text-xs text-primary hover:underline">All →</Link>
            </div>
            <div className="divide-y divide-border">
              {meetings.length === 0 && <p className="p-5 text-center text-xs text-muted-foreground">Nothing scheduled today.</p>}
              {meetings.map((m: any) => (
                <Link key={m.id} to="/meetings" className="block px-5 py-3 hover:bg-muted/40">
                  <p className="text-sm font-medium">{m.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{new Date(m.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · hosted by {profiles[m.host_id]?.full_name || "—"}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">Notifications</h2></div>
              <Link to="/notifications" className="text-xs text-primary hover:underline">All →</Link>
            </div>
            <div className="divide-y divide-border">
              {notifs.length === 0 && <p className="p-5 text-center text-xs text-muted-foreground">You're all caught up.</p>}
              {notifs.map((n: any) => (
                <div key={n.id} className="px-5 py-3">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
                </div>
              ))}
            </div>
          </section>

          {kpis.ideas && kpis.ideas.length > 0 && (
            <section className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">Fresh ideas</h2></div>
                <Link to="/rd-ideas" className="text-xs text-primary hover:underline">All →</Link>
              </div>
              <div className="divide-y divide-border">
                {kpis.ideas.map((i: any) => (
                  <Link key={i.id} to="/rd-ideas" className="block px-5 py-3 hover:bg-muted/40">
                    <p className="line-clamp-2 text-sm">{i.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{i.votes || 0} votes</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
