import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, LogOut, Settings as SettingsIcon, Search, HelpCircle, PanelLeftClose } from "lucide-react";
import { navGroups } from "./nav-config";
import { useRouteAccess } from "@/lib/hq/route-access";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentApp } from "@/lib/hq/app-context";

const STORAGE_KEY = "hq.sidebar.collapsed";

const ALWAYS_VISIBLE = new Set<string>([
  "/dashboard", "/assistant", "/settings", "/profile", "/notifications", "/search", "/teams",
]);


type Profile = { full_name: string | null; email: string | null; department: string | null };

export function Sidebar({ onNavigate, onCollapse }: { onNavigate?: () => void; onCollapse?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [query, setQuery] = useState("");
  const access = useRouteAccess();
  const { app } = useCurrentApp();

  const permittedGroups = useMemo(() => {
    // 1. Only the sections this workspace exposes.
    const inApp = app && app.nav_groups.length > 0
      ? navGroups.filter((g) => app.nav_groups.includes(g.label))
      : navGroups;
    // 2. Then the person's own page permissions.
    if (access.isAdmin || access.allowed === null) return inApp;
    return inApp
      .map((g) => ({ ...g, items: g.items.filter((i) => ALWAYS_VISIBLE.has(i.to) || access.allowed!.has(i.to)) }))
      .filter((g) => g.items.length > 0);
  }, [access, app]);

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

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate({ to: "/search", search: q ? { q } : undefined } as never);
  };

  return (
    <nav
      data-tour="sidebar"
      className="flex h-full flex-col text-sidebar-foreground"
      style={{ background: "var(--sidebar-gradient)" }}
    >
      {/* Workspace header */}
      <div className="px-3 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl bg-white/[0.06] px-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-[11px] font-black text-sidebar-accent-foreground">
              CL
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-sidebar-foreground">{app?.label || "Clovr Labs"}</p>
              <p className="truncate text-[11px] text-sidebar-muted">
                {app?.tagline || (profile?.department ? `${profile.department} workspace` : "Internal workspace")}
              </p>
            </div>
          </div>
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-sidebar-muted hover:bg-white/[0.10] hover:text-sidebar-foreground lg:flex"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>





      {/* Search */}
      <form onSubmit={onSearch} data-tour="search" className="px-3 pt-3">
        <div className="flex items-center gap-2 rounded-xl bg-[color-mix(in_oklab,var(--sidebar-foreground)_6%,transparent)] px-3 py-2 focus-within:bg-[color-mix(in_oklab,var(--sidebar-foreground)_10%,transparent)]">
          <Search className="h-3.5 w-3.5 text-sidebar-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search everything…"
            className="flex-1 bg-transparent text-[13px] text-sidebar-foreground outline-none placeholder:text-sidebar-muted"
          />
          <span className="rounded bg-[color-mix(in_oklab,var(--sidebar-foreground)_12%,transparent)] px-1.5 py-0.5 text-[10px] font-mono text-sidebar-muted">⌘K</span>
        </div>
      </form>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {permittedGroups.map((group) => {
          const isCollapsed = collapsed[group.label];
          return (
            <div key={group.label} className="mb-3">
              <button
                onClick={() => toggle(group.label)}
                className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-muted hover:text-sidebar-foreground"
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
                        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition ${
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_4px_14px_-6px_var(--sidebar-accent)]"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-hover hover:text-sidebar-foreground"
                        }`}
                      >
                        <Icon className={`h-[15px] w-[15px] flex-shrink-0 ${active ? "" : "text-sidebar-muted group-hover:text-sidebar-foreground"}`} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                            active
                              ? "bg-white/20 text-sidebar-accent-foreground"
                              : "bg-sidebar-accent/25 text-sidebar-foreground"
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

      {/* Footer links */}
      <div className="border-t border-sidebar-border px-3 py-2 text-[13px]">
        <Link to="/help" onClick={onNavigate} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/75 hover:bg-sidebar-hover hover:text-sidebar-foreground">
          <HelpCircle className="h-[15px] w-[15px] text-sidebar-muted" />
          Help & Support
        </Link>
      </div>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-sidebar-hover">
          <Link to="/profile" onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-sidebar-foreground">{profile?.full_name || "Staff"}</p>
              <p className="truncate text-[11px] text-sidebar-muted">{profile?.department || profile?.email || "Team member"}</p>
            </div>
          </Link>
          <Link to="/settings" onClick={onNavigate} className="rounded-md p-1.5 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground" aria-label="Settings">
            <SettingsIcon className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/hq-login";
            }}
            className="rounded-md p-1.5 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
