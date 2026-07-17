import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Check, Plus, Trash2, ClipboardCheck } from "lucide-react";
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
type Template = { id: string; department: string | null; task: string; category: string | null; days_offset: number; sort_order: number };

const DEPARTMENTS = ["Engineering","Manufacturing","Sales","Marketing","Finance","HR","IT","Support","Operations","Executive"];

function AccessPage() {
  const [tab, setTab] = useState<"routes"|"onboarding">("routes");
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Shield className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Admin</p>
          <h1 className="text-3xl font-semibold tracking-tight">Access & Permissions</h1>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {([["routes","Route access",Shield],["onboarding","Onboarding templates",ClipboardCheck]] as const).map(([k,label,Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab===k?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
      {tab === "routes" ? <RouteAccessMatrix /> : <TemplatesEditor />}
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
        <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Custom roles</h3>
        {roles.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">Create a role in <a href="/admin/roles" className="text-primary hover:underline">Admin → Roles</a> first.</p>
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
            <p className="text-sm text-muted-foreground">Check the routes members of <b style={{ color: role.color }}>{role.name}</b> can see. Core pages (Dashboard, Assistant, Settings) are always visible.</p>
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

function TemplatesEditor() {
  const [rows, setRows] = useState<Template[]>([]);
  const [form, setForm] = useState<Partial<Template>>({ department: "", task: "", category: "", days_offset: 0, sort_order: 0 });

  const reload = async () => {
    const { data } = await supabase.from("hr_onboarding_templates").select("*").order("department", { nullsFirst: true } as any).order("sort_order");
    setRows((data ?? []) as Template[]);
  };
  useEffect(() => { reload(); }, []);

  const add = async () => {
    if (!form.task) return;
    await supabase.from("hr_onboarding_templates").insert({
      department: form.department || null, task: form.task, category: form.category || null,
      days_offset: Number(form.days_offset ?? 0), sort_order: Number(form.sort_order ?? 0),
    });
    setForm({ department: "", task: "", category: "", days_offset: 0, sort_order: 0 });
    reload();
  };
  const del = async (id: string) => { await supabase.from("hr_onboarding_templates").delete().eq("id", id); reload(); };
  const update = async (id: string, patch: Partial<Template>) => { await supabase.from("hr_onboarding_templates").update(patch).eq("id", id); reload(); };

  return (
    <div>
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Add template task</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <select value={form.department ?? ""} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputCls}>
            <option value="">Global (all)</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input placeholder="Task" value={form.task ?? ""} onChange={(e) => setForm({ ...form, task: e.target.value })} className={`${inputCls} sm:col-span-2`} />
          <input placeholder="Category" value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} />
          <input type="number" placeholder="Days" value={form.days_offset ?? 0} onChange={(e) => setForm({ ...form, days_offset: Number(e.target.value) })} className={inputCls} />
        </div>
        <div className="mt-3">
          <button onClick={add} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> Add task
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-2 text-left">Department</th><th className="px-4 py-2 text-left">Task</th><th className="px-4 py-2 text-left">Category</th><th className="px-4 py-2 text-left">Days after start</th><th className="px-4 py-2"></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-2">{r.department ?? <span className="text-muted-foreground">Global</span>}</td>
                <td className="px-4 py-2"><input defaultValue={r.task} onBlur={(e) => e.target.value !== r.task && update(r.id, { task: e.target.value })} className="w-full bg-transparent" /></td>
                <td className="px-4 py-2"><input defaultValue={r.category ?? ""} onBlur={(e) => update(r.id, { category: e.target.value || null })} className="w-full bg-transparent" /></td>
                <td className="px-4 py-2"><input type="number" defaultValue={r.days_offset} onBlur={(e) => update(r.id, { days_offset: Number(e.target.value) })} className="w-16 bg-transparent" /></td>
                <td className="px-4 py-2 text-right"><button onClick={() => del(r.id)} className="text-xs text-destructive hover:underline"><Trash2 className="inline h-3 w-3" /></button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">No templates yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
