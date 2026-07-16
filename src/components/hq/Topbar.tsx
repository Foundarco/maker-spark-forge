import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Bell, LogOut, User as UserIcon, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Profile = { full_name: string | null; email: string | null; avatar_url: string | null };

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const initials = (profile?.full_name || profile?.email || "?").slice(0, 2).toUpperCase();

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

      <div className="flex flex-1 items-center justify-center">
        <button
          onClick={() => navigate({ to: "/search" })}
          className="flex w-full max-w-lg items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-1.5 text-left text-sm text-muted-foreground hover:border-foreground/20"
        >
          <Search className="h-4 w-4" />
          <span>Search everything…</span>
          <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">⌘K</span>
        </button>
      </div>

      <Link to="/notifications" className="relative rounded-lg p-2 hover:bg-muted" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
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
              <UserIcon className="h-4 w-4" /> Profile
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
