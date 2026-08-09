import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, LogOut, Settings as SettingsIcon, Search, HelpCircle, PanelLeftClose } from "lucide-react";
import { navGroups } from "./nav-config";
import { useRouteAccess } from "@/lib/hq/route-access";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/mcguire-logo.png.asset.json";

const STORAGE_KEY = "hq.sidebar.collapsed";

const ALWAYS_VISIBLE = new Set<string>([
  "/dashboard", "/assistant", "/settings", "/profile", "/notifications", "/search",
]);

type Profile = { full_name: string | null; email: string | null; department: string | null };

export function Sidebar({ onNavigate, onCollapse }: { onNavigate?: () => void; onCollapse?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [query, setQuery] = useState("");
  const [division, setDivision] = useState<DivisionId>("core");
  const [pickerOpen, setPickerOpen] = useState(false);
  const access = useRouteAccess();

  const permittedGroups = useMemo(() => {
    if (access.isAdmin || access.allowed === null) return navGroups;
    return navGroups
      .map((g) => ({ ...g, items: g.items.filter((i) => ALWAYS_VISIBLE.has(i.to) || access.allowed!.has(i.to)) }))
      .filter((g) => g.items.length > 0);
  }, [access]);

  const availableDivisions = useMemo(
    () => divisions.filter((d) => permittedGroups.some((g) => g.division === d.id)),
    [permittedGroups],
  );

  // Follow the current route into its division so deep links land in context.
  useEffect(() => {
    const owner = permittedGroups.find((g) => g.items.some((i) => pathname.startsWith(i.to)));
    if (owner && owner.division !== "core") setDivision(owner.division);
  }, [pathname, permittedGroups]);

  const filteredGroups = useMemo(() => {
    const core = permittedGroups.filter((g) => g.division === "core");
    if (division === "core") return core;
    return [...core, ...permittedGroups.filter((g) => g.division === division)];
  }, [permittedGroups, division]);

  const activeDivision = divisions.find((d) => d.id === division) ?? divisions[0];


  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCollapsed(JSON.parse(raw));
      const d = localStorage.getItem(DIVISION_KEY) as DivisionId | null;
      if (d && divisions.some((x) => x.id === d)) setDivision(d);
    } catch {}
  }, []);

  const pickDivision = (id: DivisionId) => {
    setDivision(id);
    setPickerOpen(false);
    try { localStorage.setItem(DIVISION_KEY, id); } catch {}
  };


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
      className="flex h-full flex-col text-sidebar-foreground"
      style={{ background: "var(--sidebar-gradient)" }}
    >
      {/* Workspace + division switcher */}
      <div className="px-3 pt-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <button
              onClick={() => setPickerOpen((v) => !v)}
              aria-expanded={pickerOpen}
              aria-haspopup="listbox"
              className="flex h-11 w-full items-center gap-3 rounded-xl bg-white/[0.06] px-3 text-left hover:bg-white/[0.10]"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                <activeDivision.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-sidebar-foreground">{activeDivision.label}</p>
                <p className="truncate text-[11px] text-sidebar-muted">{activeDivision.blurb}</p>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 text-sidebar-muted transition ${pickerOpen ? "rotate-180" : ""}`} />
            </button>

            {pickerOpen && (
              <div
                role="listbox"
                className="absolute left-0 right-0 top-[52px] z-30 overflow-hidden rounded-xl border border-sidebar-border bg-[#0d1526] p-1 shadow-2xl"
              >
                {availableDivisions.map((d) => (
                  <button
                    key={d.id}
                    role="option"
                    aria-selected={d.id === division}
                    onClick={() => pickDivision(d.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] ${
                      d.id === division ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/85 hover:bg-sidebar-hover"
                    }`}
                  >
                    <d.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{d.label}</span>
                    {d.id === division && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            )}
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
      <form onSubmit={onSearch} className="px-3 pt-3">
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
        {filteredGroups.map((group) => {
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
