import { Link } from "@tanstack/react-router";
import { Bell, LogOut, User as UserIcon, Menu, Phone, Grid3x3, Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RecordTabs } from "./RecordTabs";

type Profile = { full_name: string | null; email: string | null; avatar_url: string | null };
type Notification = {
  id: string;
  title: string | null;
  body: string | null;
  created_at: string;
  read_at: string | null;
};

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unread, setUnread] = useState(0);
  const [eventsToday, setEventsToday] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid || !mounted) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, email, avatar_url")
        .eq("id", uid)
        .maybeSingle();
      if (mounted && p) setProfile(p as Profile);

      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .is("read_at", null);
      if (mounted && count !== null) setUnread(count);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!notifOpen) return;
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, body, created_at, read_at")
        .order("created_at", { ascending: false })
        .limit(6);
      if (data) setNotifs(data as Notification[]);
    })();
  }, [notifOpen]);

  const initials = (profile?.full_name || profile?.email || "?").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-xl">
      {/* Chrome row */}
      <div className="flex h-11 items-center gap-2 px-4">
        <button className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={onMenuClick} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden items-center gap-1.5 text-muted-foreground lg:flex">
          <Sun className="h-4 w-4" />
          <span className="text-xs">72°F · Fair</span>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="flex h-8 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" /> Quick Add
        </button>

        <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Call">
          <Phone className="h-4 w-4" />
        </button>

        <Link to="/files" className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-medium hover:bg-muted">
          Docbox
          <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">50</span>
        </Link>

        <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Apps">
          <Grid3x3 className="h-4 w-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); setMenuOpen(false); }}
            className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 rounded-xl border border-border bg-card p-1 shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <p className="text-sm font-semibold">Notifications</p>
                <span className="text-xs text-muted-foreground">{unread} unread</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 && (
                  <p className="px-3 py-6 text-center text-xs text-muted-foreground">No notifications</p>
                )}
                {notifs.map((n) => (
                  <div key={n.id} className={`border-b border-border/50 px-3 py-2 text-sm last:border-0 ${!n.read_at ? "bg-primary/5" : ""}`}>
                    <p className="truncate font-medium">{n.title ?? "Notification"}</p>
                    {n.body && <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/notifications"
                onClick={() => setNotifOpen(false)}
                className="block border-t border-border px-3 py-2 text-center text-xs font-medium text-primary hover:bg-muted"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setMenuOpen((v) => !v); setNotifOpen(false); }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
          >
            {initials}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 w-56 rounded-xl border border-border bg-card p-1 shadow-xl">
              <div className="border-b border-border px-3 py-2">
                <p className="truncate text-sm font-medium">{profile?.full_name ?? "Staff"}</p>
                <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
              </div>
              <Link to="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
                <UserIcon className="h-4 w-4" /> Profile & Settings
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/hq-login";
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Record tabs row */}
      <RecordTabs />
    </header>
  );
}
