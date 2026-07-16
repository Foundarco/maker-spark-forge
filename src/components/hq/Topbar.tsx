import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Bell, LogOut, User as UserIcon, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Profile = { full_name: string | null; email: string | null; avatar_url: string | null };
type Notification = {
  id: string;
  title: string | null;
  body: string | null;
  created_at: string;
  read_at: string | null;
};

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

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

  // Cmd/Ctrl+K to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const initials = (profile?.full_name || profile?.email || "?").slice(0, 2).toUpperCase();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate({ to: "/search", search: q ? { q } : undefined } as never);
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-xl">
      <button className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={onMenuClick} aria-label="Menu">
        <Menu className="h-5 w-5" />
      </button>

      <Link to="/dashboard" className="mr-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <span className="text-xs font-bold">HQ</span>
        </div>
        <span className="hidden text-sm font-semibold sm:inline">Clovr HQ</span>
      </Link>

      <form onSubmit={submitSearch} className="flex flex-1 items-center justify-center">
        <div className="flex w-full max-w-lg items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-1.5 focus-within:border-foreground/30">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything — customer, order, part, person… (Enter to open full search)"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">⌘K</span>
        </div>
      </form>

      <div className="relative">
        <button
          onClick={() => { setNotifOpen((v) => !v); setMenuOpen(false); }}
          className="relative rounded-lg p-2 hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-11 w-80 rounded-lg border border-border bg-card p-1 shadow-xl">
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
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
        >
          {initials}
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-11 w-56 rounded-lg border border-border bg-card p-1 shadow-xl">
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
    </header>
  );
}
