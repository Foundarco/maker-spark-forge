import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, LogOut, Settings as SettingsIcon } from "lucide-react";
import { navGroups } from "./nav-config";
import { useRouteAccess } from "@/lib/hq/route-access";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "hq.sidebar.collapsed";

const ALWAYS_VISIBLE = new Set<string>([
  "/dashboard", "/assistant", "/settings", "/profile", "/notifications", "/search",
]);

type Profile = { full_name: string | null; email: string | null; department: string | null };

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const access = useRouteAccess();

  const filteredGroups = useMemo(() => {
    if (access.isAdmin || access.allowed === null) return navGroups;
    return navGroups
      .map((g) => ({ ...g, items: g.items.filter((i) => ALWAYS_VISIBLE.has(i.to) || access.allowed!.has(i.to)) }))
      .filter((g) => g.items.length > 0);
  }, [access]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCollapsed(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, email, department")
        .eq("id", u.user.id)
        .maybeSingle();
      if (p) setProfile(p as Profile);
    })();
  }, []);

  const toggle = (label: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const initials = (profile?.full_name || profile?.email || "?")
    .split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  return (
    <nav className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground shadow-lg shadow-sidebar-accent/30">
          <span className="text-[11px] font-bold tracking-tight">HQ</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Clovr HQ</p>
          <p className="truncate text-[10px] text-sidebar-muted">Internal Workspace</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-sidebar-muted" />
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {filteredGroups.map((group) => {
          const isCollapsed = collapsed[group.label];
          return (
            <div key={group.label} className="mb-2">
              <button
                onClick={() => toggle(group.label)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-muted hover:text-sidebar-foreground"
              >
                {group.label}
                <ChevronDown className={`h-3 w-3 transition ${isCollapsed ? "-rotate-90" : ""}`} />
              </button>
              {!isCollapsed && (
                <div className="mt-1 space-y-0.5">
                  {group.items.map((item) => {
                    const active = pathname === item.to || (item.to === "/dashboard" && pathname === "/");
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={onNavigate}
                        className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition ${
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm shadow-sidebar-accent/30"
                            : "text-sidebar-foreground/75 hover:bg-white/5 hover:text-sidebar-foreground"
                        }`}
                      >
                        <Icon className={`h-4 w-4 flex-shrink-0 ${active ? "" : "text-sidebar-muted group-hover:text-sidebar-foreground"}`} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                            active
                              ? "bg-white/20 text-sidebar-accent-foreground"
                              : "bg-sidebar-accent/20 text-sidebar-accent"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3">
        <Link
          to="/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent/20 text-xs font-bold text-sidebar-accent">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{profile?.full_name || "Staff"}</p>
            <p className="truncate text-[10px] text-sidebar-muted">{profile?.department || profile?.email || "Team member"}</p>
          </div>
          <Link to="/settings" onClick={(e) => { e.stopPropagation(); onNavigate?.(); }} className="rounded-md p-1.5 text-sidebar-muted hover:bg-white/10 hover:text-sidebar-foreground" aria-label="Settings">
            <SettingsIcon className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await supabase.auth.signOut();
              window.location.href = "/hq-login";
            }}
            className="rounded-md p-1.5 text-sidebar-muted hover:bg-white/10 hover:text-sidebar-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </Link>
      </div>
    </nav>
  );
}
