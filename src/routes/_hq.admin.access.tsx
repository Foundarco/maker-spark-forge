import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Check } from "lucide-react";
import { navGroups } from "@/components/hq/nav-config";

export const Route = createFileRoute("/_hq/admin/access")({
  head: () => ({ meta: [{ title: "Access & Permissions — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/hq-login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    const rs = (roles ?? []).map((r: any) => r.role);
    if (!(rs.includes("super_admin") || rs.includes("admin"))) throw redirect({ to: "/dashboard" });
  },
  component: AccessPage,
});

type CustomRole = { id: string; name: string; color: string; permissions: any };
type RouteAccess = { role_id: string; route: string };

function AccessPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Shield className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Admin</p>
          <h1 className="text-3xl font-semibold tracking-tight">Access & Permissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Control which tabs each role can see. Create roles in <a href="/admin/company" className="text-primary hover:underline">Company Settings → Roles & Permissions</a>.</p>
        </div>
      </div>
      <RouteAccessMatrix />
    </div>
  );
}

function RouteAccessMatrix() {
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [access, setAccess] = useState<RouteAccess[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const reload = async () => {
    const [r, a] = await Promise.all([
      supabase.from("custom_roles").select("id, name, color, permissions").order("position", { ascending: false }),
      supabase.from("role_route_access").select("role_id, route"),
    ]);
    setRoles((r.data ?? []) as CustomRole[]);
    setAccess((a.data ?? []) as RouteAccess[]);
    if (!selectedRole && r.data && r.data.length) setSelectedRole((r.data[0] as any).id);
  };
  useEffect(() => { reload(); }, []);

  const currentAccess = useMemo(() => new Set(access.filter((a) => a.role_id === selectedRole).map((a) => a.route)), [access, selectedRole]);

  const toggle = async (route: string) => {
    if (!selectedRole) return;
    const has = currentAccess.has(route);
    if (has) {
      await supabase.from("role_route_access").delete().eq("role_id", selectedRole).eq("route", route);
      setAccess((prev) => prev.filter((a) => !(a.role_id === selectedRole && a.route === route)));
    } else {
      await supabase.from("role_route_access").insert({ role_id: selectedRole, route });
      setAccess((prev) => [...prev, { role_id: selectedRole, route }]);
    }
  };

  const toggleGroup = async (routes: string[], grant: boolean) => {
    if (!selectedRole) return;
    if (grant) {
      const toAdd = routes.filter((r) => !currentAccess.has(r));
      if (toAdd.length === 0) return;
      await supabase.from("role_route_access").insert(toAdd.map((r) => ({ role_id: selectedRole, route: r })));
    } else {
      await supabase.from("role_route_access").delete().eq("role_id", selectedRole).in("route", routes);
    }
    reload();
  };

  const role = roles.find((r) => r.id === selectedRole);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <aside className="lg:col-span-1 rounded-xl border border-border bg-card p-3">
        <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Roles</h3>
        {roles.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">Create a role in <a href="/admin/company" className="text-primary hover:underline">Company Settings</a> first.</p>
        ) : roles.map((r) => (
          <button key={r.id} onClick={() => setSelectedRole(r.id)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm ${selectedRole===r.id?"bg-primary/10":"hover:bg-muted"}`}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }} />
            <span style={{ color: r.color }}>{r.name}</span>
            {r.permissions?.admin && <span className="ml-auto rounded bg-primary/20 px-1.5 py-0.5 text-[9px] uppercase text-primary">All</span>}
          </button>
        ))}
      </aside>

      <section className="lg:col-span-3">
        {!role ? <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Select a role to configure route access.</p> : role.permissions?.admin ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm">This role has <b>Administrator</b> permission — it has access to every route automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Check the tabs members of <b style={{ color: role.color }}>{role.name}</b> can see. Core pages (Dashboard, Assistant, Settings) are always visible.</p>
            {navGroups.map((g) => {
              const groupRoutes = g.items.map((i) => i.to);
              const allSelected = groupRoutes.every((r) => currentAccess.has(r));
              const someSelected = groupRoutes.some((r) => currentAccess.has(r));
              return (
                <div key={g.label} className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</h4>
                    <button onClick={() => toggleGroup(groupRoutes, !allSelected)} className="text-xs text-primary hover:underline">
                      {allSelected ? "Clear all" : "Select all"}{someSelected && !allSelected ? ` (${groupRoutes.filter((r) => currentAccess.has(r)).length}/${groupRoutes.length})` : ""}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {g.items.map((i) => {
                      const has = currentAccess.has(i.to);
                      return (
                        <button key={i.to} onClick={() => toggle(i.to)} className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm ${has ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/30"}`}>
                          <div className={`flex h-4 w-4 items-center justify-center rounded border ${has ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}>
                            {has && <Check className="h-3 w-3" />}
                          </div>
                          <i.icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="flex-1">{i.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
