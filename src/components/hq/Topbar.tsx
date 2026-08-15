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
  { to: "/drive", label: "Drive", icon: FolderOpen },
  { to: "/employees", label: "People", icon: Users },
  { to: "/assistant", label: "Assistant", icon: Bot },
] as const;

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState<null | "notif" | "apps" | "phone">(null);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [, tick] = useState(0);
  const { active, endCall, toggleMute, incoming, acceptIncoming, declineIncoming } = usePhone();

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
    if (open !== "notif") return;
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, body, created_at, read_at")
        .order("created_at", { ascending: false })
        .limit(6);
      if (data) setNotifs(data as Notification[]);
    })();
  }, [open]);

  useEffect(() => {
    if (!active || active.status !== "active") return;
    const t = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  // Outside click closes all
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-topbar-menu]")) setOpen(null);
    };
    const id = setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", onDoc); };
  }, [open]);

  const toggle = (which: "notif" | "apps" | "phone") => setOpen((cur) => (cur === which ? null : which));

  const iconBtn = "relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm transition hover:bg-muted hover:border-primary/40";
  const iconBtnActive = "border-primary/60 bg-primary/10 text-primary";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-xl">
      {/* Incoming call banner */}
      {incoming && (
        <div className="flex items-center gap-3 border-b border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Phone className="h-3.5 w-3.5 animate-pulse" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{incoming.fromName}</p>
            <p className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Incoming call…</p>
          </div>
          <button onClick={acceptIncoming} className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600">Accept</button>
          <button onClick={declineIncoming} className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">Decline</button>
        </div>
      )}

      <div className="flex h-12 items-center gap-2 px-4">
        <button className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={onMenuClick} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1" />

        {/* Phone */}
        <div className="relative" data-topbar-menu>
          <button
            onClick={() => toggle("phone")}
            className={`${iconBtn} ${open === "phone" || active ? iconBtnActive : ""}`}
            aria-label="Phone"
          >
            <Phone className="h-4 w-4" />
            {active && (
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500 shadow" />
            )}
          </button>
          {open === "phone" && (
            <div className="absolute right-0 top-12 w-72 rounded-xl border border-border bg-card p-1 shadow-xl">
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
                        {active.status === "ringing" ? "Ringing…" : active.status === "connecting" ? "Connecting…" : `On call · ${formatDuration(active.startedAt, null)}`}
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
                  <Link to="/phone" onClick={() => setOpen(null)} className="mt-2 block rounded-md py-1.5 text-center text-xs text-primary hover:bg-muted">
                    Open phone →
                  </Link>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">No active call.</p>
                  <Link to="/phone" onClick={() => setOpen(null)} className="mt-2 inline-block rounded-md px-3 py-1.5 text-xs font-medium text-primary hover:bg-muted">
                    Open phone →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Apps grid */}
        <div className="relative" data-topbar-menu>
          <button
            onClick={() => toggle("apps")}
            className={`${iconBtn} ${open === "apps" ? iconBtnActive : ""}`}
            aria-label="Apps"
          >
            <Grip className="h-4 w-4" />
          </button>
          {open === "apps" && (
            <div className="absolute right-0 top-12 w-64 rounded-xl border border-border bg-card p-2 shadow-xl">
              <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Apps</p>
              <div className="grid grid-cols-3 gap-1">
                {APPS.map((a) => (
                  <Link key={a.to} to={a.to} onClick={() => setOpen(null)} className="flex flex-col items-center gap-1 rounded-lg p-3 text-center hover:bg-muted">
                    <a.icon className="h-5 w-5 text-primary" />
                    <span className="text-[11px] font-medium">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(resolveTheme(theme) === "dark" ? "light" : "dark")}
          className={iconBtn}
          aria-label="Toggle light or dark mode"
        >
          {resolveTheme(theme) === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>



        {/* Notifications */}
        <div className="relative" data-topbar-menu>
          <button
            onClick={() => toggle("notif")}
            className={`${iconBtn} ${open === "notif" ? iconBtnActive : ""}`}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground shadow">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          {open === "notif" && (
            <div className="absolute right-0 top-12 w-80 rounded-xl border border-border bg-card p-1 shadow-xl">
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
                onClick={() => setOpen(null)}
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
