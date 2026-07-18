import { Link } from "@tanstack/react-router";
import { Bell, Menu, Phone, PhoneOff, Mic, MicOff, Grip, LayoutDashboard, Mail, Calendar as CalendarIcon, FolderOpen, MessagesSquare, Users, Bot } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RecordTabs } from "./RecordTabs";
import { usePhone, formatDuration } from "@/lib/hq/phone";

type Notification = {
  id: string;
  title: string | null;
  body: string | null;
  created_at: string;
  read_at: string | null;
};

const APPS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mail", label: "Email", icon: Mail },
  { to: "/channels", label: "Channels", icon: MessagesSquare },
  { to: "/phone", label: "Phone", icon: Phone },
  { to: "/calendar", label: "Calendar", icon: CalendarIcon },
  { to: "/files", label: "Files", icon: FolderOpen },
  { to: "/employees", label: "People", icon: Users },
  { to: "/assistant", label: "Assistant", icon: Bot },
] as const;

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [unread, setUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [appsOpen, setAppsOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [, tick] = useState(0);
  const { active, endCall, toggleMute } = usePhone();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || !mounted) return;
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

  useEffect(() => {
    if (!active || active.status !== "active") return;
    const t = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  const closeAll = () => { setNotifOpen(false); setAppsOpen(false); setPhoneOpen(false); };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="flex h-11 items-center gap-2 px-4">
        <button className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={onMenuClick} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1" />

        {/* Phone */}
        <div className="relative">
          <button
            onClick={() => { closeAll(); setPhoneOpen((v) => !v); }}
            className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted"
            aria-label="Phone"
          >
            <Phone className="h-4 w-4" />
            {active && (
              <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full border border-background bg-emerald-500 shadow" />
            )}
          </button>
          {phoneOpen && (
            <div className="absolute right-0 top-11 w-72 rounded-xl border border-border bg-card p-1 shadow-xl">
              <div className="border-b border-border px-3 py-2">
                <p className="text-sm font-semibold">Phone</p>
              </div>
              {active ? (
                <div className="p-3">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {active.peerName.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{active.peerName}</p>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {active.status === "ringing" ? "Ringing…" : `On call · ${formatDuration(active.startedAt, null)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className={`flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 text-xs ${active.muted ? "border-border bg-muted" : "border-border hover:bg-muted"}`}>
                      {active.muted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                      {active.muted ? "Unmute" : "Mute"}
                    </button>
                    <button onClick={endCall} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-500 py-1.5 text-xs font-medium text-white hover:bg-red-600">
                      <PhoneOff className="h-3 w-3" /> End
                    </button>
                  </div>
                  <Link to="/phone" onClick={() => setPhoneOpen(false)} className="mt-2 block rounded-md py-1.5 text-center text-xs text-primary hover:bg-muted">
                    Open phone →
                  </Link>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">No active call.</p>
                  <Link to="/phone" onClick={() => setPhoneOpen(false)} className="mt-2 inline-block rounded-md px-3 py-1.5 text-xs font-medium text-primary hover:bg-muted">
                    Open phone →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Apps grid (dots) */}
        <div className="relative">
          <button
            onClick={() => { closeAll(); setAppsOpen((v) => !v); }}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            aria-label="Apps"
          >
            <Grip className="h-4 w-4" />
          </button>
          {appsOpen && (
            <div className="absolute right-0 top-11 w-64 rounded-xl border border-border bg-card p-2 shadow-xl">
              <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Apps</p>
              <div className="grid grid-cols-3 gap-1">
                {APPS.map((a) => (
                  <Link key={a.to} to={a.to} onClick={() => setAppsOpen(false)} className="flex flex-col items-center gap-1 rounded-lg p-3 text-center hover:bg-muted">
                    <a.icon className="h-5 w-5 text-primary" />
                    <span className="text-[11px] font-medium">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { closeAll(); setNotifOpen((v) => !v); }}
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
      </div>

      <RecordTabs />
    </header>
  );
}
