import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Network, Shield, Users, Plus, Trash2, Check } from "lucide-react";
import {
  loadOrg, buildTree, setRoleRoute, assignUserUnit, setUserRole, setUserOverride,
  ROUTE_CATALOG, slugify, type OrgUnit, type OrgRole, type OrgMember,
} from "@/lib/hq/org";
import { UserMention } from "@/components/hq/UserMention";

const db = supabase as any;

export const Route = createFileRoute("/_hq/admin/org")({
  head: () => ({ meta: [{ title: "Organization — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/hq-login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    const rs = (roles ?? []).map((r: any) => r.role);
    if (!(rs.includes("super_admin") || rs.includes("admin"))) throw redirect({ to: "/dashboard" });
  },
  component: OrgAdmin,
});

type Tab = "structure" | "access" | "people";

function OrgAdmin() {
  const [tab, setTab] = useState<Tab>("structure");
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [roles, setRoles] = useState<OrgRole[]>([]);
  const [routes, setRoutes] = useState<{ role_id: string; route: string }[]>([]);
  const [people, setPeople] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const data = await loadOrg();
    setUnits(data.units); setRoles(data.roles); setRoutes(data.routes); setPeople(data.people);
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Network className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Administration</p>
          <h1 className="text-3xl font-semibold tracking-tight">Organization</h1>
          <p className="mt-1 text-sm text-muted-foreground">Divisions, teams, team roles and exactly which pages each team can open.</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {([["structure", "Structure", Network], ["access", "Roles & Access", Shield], ["people", "People", Users]] as Array<[Tab, string, any]>).map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading organization…</p> : (
        <>
          {tab === "structure" && <Structure units={units} people={people} roles={roles} onChange={reload} />}
          {tab === "access" && <AccessMatrix units={units} roles={roles} routes={routes} onChange={reload} />}
          {tab === "people" && <PeopleTab units={units} roles={roles} people={people} onChange={reload} />}
        </>
      )}
    </div>
  );
}

/* ───────────────────────────── Structure ───────────────────────────── */

function Structure({ units, people, roles, onChange }: { units: OrgUnit[]; people: OrgMember[]; roles: OrgRole[]; onChange: () => void }) {
  const tree = useMemo(() => buildTree(units), [units]);
  const [newTeam, setNewTeam] = useState<Record<string, string>>({});
  const [newDivision, setNewDivision] = useState("");

  const headcount = (unitId: string) => {
    const kids = (tree.get(unitId) ?? []).map((u) => u.id);
    return people.filter((p) => p.org_unit_id === unitId || kids.includes(p.org_unit_id ?? "")).length;
  };

  const addUnit = async (name: string, parentId: string | null, kind: string) => {
    if (!name.trim()) return;
    const { data } = await db.from("org_units").insert({
      name: name.trim(), slug: slugify(name) + "-" + Math.random().toString(36).slice(2, 6),
      parent_id: parentId, kind, sort_order: units.filter((u) => u.parent_id === parentId).length,
    }).select("id, name, slug").maybeSingle();
    if (data) {
      await db.from("org_roles").insert([
        { name: `${data.name} — Member`, slug: `${data.slug}-member`, org_unit_id: data.id, kind: "department", level: "member", is_default: true },
        { name: `${data.name} — Lead`, slug: `${data.slug}-lead`, org_unit_id: data.id, kind: "department", level: "lead" },
      ]);
    }
    onChange();
  };

  const removeUnit = async (id: string) => {
    if (!confirm("Delete this unit and its teams, roles and access?")) return;
    await db.from("org_units").delete().eq("id", id);
    onChange();
  };

  const divisions = tree.get(null) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={newDivision} onChange={(e) => setNewDivision(e.target.value)} placeholder="New division name…"
          className="w-72 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <button onClick={() => { addUnit(newDivision, null, "division"); setNewDivision(""); }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" /> Add division
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {divisions.map((d) => (
          <div key={d.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link to="/teams/$slug" params={{ slug: d.slug }} className="text-base font-semibold hover:text-primary">{d.name}</Link>
                <p className="text-xs text-muted-foreground">{headcount(d.id)} people · {(tree.get(d.id) ?? []).length} teams · {roles.filter((r) => r.org_unit_id === d.id).length} roles</p>
              </div>
              <button onClick={() => removeUnit(d.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <div className="mt-3 space-y-1">
              {(tree.get(d.id) ?? []).map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-1.5 text-sm">
                  <Link to="/teams/$slug" params={{ slug: t.slug }} className="hover:text-primary">{t.name}</Link>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {people.filter((p) => p.org_unit_id === t.id).length} people
                    <button onClick={() => removeUnit(t.id)} className="rounded p-1 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={newTeam[d.id] ?? ""} onChange={(e) => setNewTeam((s) => ({ ...s, [d.id]: e.target.value }))}
                placeholder="Add team…" className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm" />
              <button onClick={() => { addUnit(newTeam[d.id] ?? "", d.id, "team"); setNewTeam((s) => ({ ...s, [d.id]: "" })); }}
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">Add</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────── Access matrix ───────────────────────────── */

function AccessMatrix({ units, roles, routes, onChange }: { units: OrgUnit[]; roles: OrgRole[]; routes: { role_id: string; route: string }[]; onChange: () => void }) {
  const [roleId, setRoleId] = useState<string>(roles[0]?.id ?? "");
  const [newRole, setNewRole] = useState("");
  const active = roles.find((r) => r.id === roleId);
  const has = (route: string) => routes.some((r) => r.role_id === roleId && r.route === route);
  const unitName = (id: string | null) => units.find((u) => u.id === id)?.name ?? "Company-wide";

  const toggle = async (route: string, on: boolean) => { await setRoleRoute(roleId, route, on); onChange(); };

  const createRole = async () => {
    if (!newRole.trim()) return;
    const { data } = await db.from("org_roles").insert({
      name: newRole.trim(), slug: slugify(newRole) + "-" + Math.random().toString(36).slice(2, 6), kind: "custom", level: "member",
    }).select("id").maybeSingle();
    setNewRole("");
    onChange();
    if (data?.id) setRoleId(data.id);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="mb-2 flex gap-1.5">
          <input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="New custom role…"
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm" />
          <button onClick={createRole} className="rounded-lg bg-primary px-2.5 py-1.5 text-sm text-primary-foreground"><Plus className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[70vh] space-y-0.5 overflow-y-auto">
          {roles.map((r) => (
            <button key={r.id} onClick={() => setRoleId(r.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm ${roleId === r.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
              <span className="block truncate font-medium">{r.name}</span>
              <span className="block truncate text-[11px] text-muted-foreground">{unitName(r.org_unit_id)}{r.is_default ? " · default" : ""}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        {!active ? <p className="text-sm text-muted-foreground">Pick a role.</p> : (
          <>
            <h2 className="text-lg font-semibold">{active.name}</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              {unitName(active.org_unit_id)} · {active.level}{active.is_default ? " · automatically applied to everyone in this team" : ""}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {ROUTE_CATALOG.map((group) => (
                <div key={group.label}>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.routes.map((r) => {
                      const on = has(r.to);
                      return (
                        <button key={r.to + group.label} onClick={() => toggle(r.to, !on)}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm ${on ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
                          <span className={`flex h-4 w-4 items-center justify-center rounded border ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                            {on && <Check className="h-3 w-3" />}
                          </span>
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────── People ───────────────────────────── */

function PeopleTab({ units, roles, people, onChange }: { units: OrgUnit[]; roles: OrgRole[]; people: OrgMember[]; onChange: () => void }) {
  const [assigned, setAssigned] = useState<{ user_id: string; role_id: string }[]>([]);
  const [overrides, setOverrides] = useState<{ user_id: string; route: string; granted: boolean }[]>([]);
  const [q, setQ] = useState("");
  const [openUser, setOpenUser] = useState<string | null>(null);

  const reloadAssignments = async () => {
    const [a, o] = await Promise.all([
      db.from("user_org_roles").select("user_id, role_id"),
      db.from("user_route_overrides").select("user_id, route, granted"),
    ]);
    setAssigned(a.data ?? []); setOverrides(o.data ?? []);
  };
  useEffect(() => { reloadAssignments(); }, []);

  const filtered = people.filter((p) => `${p.full_name ?? ""} ${p.email ?? ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people…"
        className="w-72 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-2">Person</th><th className="px-4 py-2">Team</th><th className="px-4 py-2">Extra roles</th><th className="px-4 py-2">Overrides</th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const myRoles = assigned.filter((a) => a.user_id === p.id);
              const myOverrides = overrides.filter((o) => o.user_id === p.id);
              return (
                <tr key={p.id} className="border-t border-border align-top">
                  <td className="px-4 py-2">
                    <UserMention userId={p.id} name={p.full_name || p.email || "Unknown"} />
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.title || "—"}</p>
                  </td>
                  <td className="px-4 py-2">
                    <select value={p.org_unit_id ?? ""} onChange={async (e) => { await assignUserUnit(p.id, e.target.value || null); onChange(); }}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-sm">
                      <option value="">Unassigned</option>
                      {units.map((u) => <option key={u.id} value={u.id}>{u.parent_id ? "— " : ""}{u.name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => setOpenUser(openUser === p.id ? null : p.id)} className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted">
                      {myRoles.length} role{myRoles.length === 1 ? "" : "s"} · edit
                    </button>
                    {openUser === p.id && (
                      <div className="mt-2 max-h-64 w-72 space-y-0.5 overflow-y-auto rounded-lg border border-border bg-background p-2">
                        {roles.map((r) => {
                          const on = myRoles.some((a) => a.role_id === r.id);
                          return (
                            <button key={r.id} onClick={async () => { await setUserRole(p.id, r.id, !on); reloadAssignments(); }}
                              className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs ${on ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                              <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{on && <Check className="h-2.5 w-2.5" />}</span>
                              <span className="truncate">{r.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {myOverrides.map((o) => (
                        <button key={o.route} onClick={async () => { await setUserOverride(p.id, o.route, null); reloadAssignments(); }}
                          className={`rounded-full px-2 py-0.5 text-[11px] ${o.granted ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                          {o.granted ? "+" : "−"}{o.route}
                        </button>
                      ))}
                      <OverrideAdder userId={p.id} onDone={reloadAssignments} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OverrideAdder({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");
  if (!open) return <button onClick={() => setOpen(true)} className="rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted">+ override</button>;
  return (
    <span className="flex items-center gap-1">
      <select value={route} onChange={(e) => setRoute(e.target.value)} className="rounded border border-border bg-background px-1 py-0.5 text-[11px]">
        <option value="">page…</option>
        {ROUTE_CATALOG.flatMap((g) => g.routes).map((r) => <option key={r.to + r.label} value={r.to}>{r.label}</option>)}
      </select>
      <button onClick={async () => { if (route) { await setUserOverride(userId, route, true); onDone(); } setOpen(false); }} className="rounded bg-primary px-1.5 py-0.5 text-[11px] text-primary-foreground">allow</button>
      <button onClick={async () => { if (route) { await setUserOverride(userId, route, false); onDone(); } setOpen(false); }} className="rounded bg-destructive px-1.5 py-0.5 text-[11px] text-destructive-foreground">block</button>
    </span>
  );
}
