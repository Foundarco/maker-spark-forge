import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Shield, LayoutGrid, ArrowLeft } from "lucide-react";
import { loadOrg, buildTree, type OrgUnit, type OrgRole, type OrgMember } from "@/lib/hq/org";
import { navGroups } from "@/components/hq/nav-config";
import { UserMention } from "@/components/hq/UserMention";

const db = supabase as any;

export const Route = createFileRoute("/_hq/teams/$slug")({
  head: () => ({ meta: [{ title: "Team workspace — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: TeamWorkspace,
});

const ROUTE_LABEL = new Map(navGroups.flatMap((g) => g.items.map((i) => [i.to, i] as const)));

function TeamWorkspace() {
  const { slug } = useParams({ from: "/_hq/teams/$slug" });
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [roles, setRoles] = useState<OrgRole[]>([]);
  const [routes, setRoutes] = useState<{ role_id: string; route: string }[]>([]);
  const [people, setPeople] = useState<OrgMember[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const d = await loadOrg();
      setUnits(d.units); setRoles(d.roles); setRoutes(d.routes); setPeople(d.people);
      const t = await db.from("con_tasks").select("id, title, status, priority, due_date, department").limit(200);
      setTasks(t.data ?? []);
      setLoading(false);
    })();
  }, [slug]);

  const tree = useMemo(() => buildTree(units), [units]);
  const unit = units.find((u) => u.slug === slug);
  const children = unit ? (tree.get(unit.id) ?? []) : [];
  const memberIds = useMemo(() => {
    if (!unit) return [] as string[];
    const ids = [unit.id, ...children.map((c) => c.id)];
    return people.filter((p) => ids.includes(p.org_unit_id ?? "")).map((p) => p.id);
  }, [unit, children, people]);
  const members = people.filter((p) => memberIds.includes(p.id));
  const teamRoles = unit ? roles.filter((r) => r.org_unit_id === unit.id || children.some((c) => c.id === r.org_unit_id)) : [];
  const teamRouteSet = Array.from(new Set(routes.filter((r) => teamRoles.some((tr) => tr.id === r.role_id)).map((r) => r.route)));
  const openTasks = tasks.filter((t) => t.status !== "done" && t.status !== "closed");

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Loading team…</div>;
  if (!unit) return <div className="p-8 text-sm text-muted-foreground">Team not found.</div>;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <Link to="/teams" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> All teams
      </Link>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><LayoutGrid className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{unit.kind === "division" ? "Division" : "Team"} workspace</p>
          <h1 className="text-3xl font-semibold tracking-tight">{unit.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{unit.description || `${members.length} people · ${teamRoles.length} roles · ${teamRouteSet.length} tools`}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[["People", members.length], ["Sub-teams", children.length], ["Roles", teamRoles.length], ["Open tasks", openTasks.length]].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value as number}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><LayoutGrid className="h-4 w-4 text-primary" /> This team's tools</h2>
            {teamRouteSet.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pages assigned yet — set them in Organization → Roles & Access.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {teamRouteSet.map((r) => {
                  const item = ROUTE_LABEL.get(r);
                  const Icon = item?.icon;
                  return (
                    <Link key={r} to={r as never} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:border-primary hover:text-primary">
                      {Icon && <Icon className="h-4 w-4" />}{item?.label ?? r}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {children.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold">Sub-teams</h2>
              <div className="flex flex-wrap gap-1.5">
                {children.map((c) => (
                  <Link key={c.id} to="/teams/$slug" params={{ slug: c.slug }}
                    className="rounded-full bg-muted px-3 py-1 text-xs hover:bg-primary/10 hover:text-primary">
                    {c.name} · {people.filter((p) => p.org_unit_id === c.id).length}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Open work</h2>
            {openTasks.length === 0 ? <p className="text-sm text-muted-foreground">Nothing open.</p> : (
              <div className="space-y-1">
                {openTasks.slice(0, 8).map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                    <span className="truncate">{t.title}</span>
                    <span className="text-xs text-muted-foreground">{t.due_date ?? t.priority ?? ""}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-primary" /> Members</h2>
            {members.length === 0 ? <p className="text-sm text-muted-foreground">No one assigned yet.</p> : (
              <div className="flex flex-wrap gap-1.5">
                {members.map((m) => <UserMention key={m.id} userId={m.id} name={m.full_name || m.email || "Unknown"} />)}
              </div>
            )}
          </section>
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Shield className="h-4 w-4 text-primary" /> Roles</h2>
            <div className="space-y-1">
              {teamRoles.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-1.5 text-sm">
                  <span className="truncate">{r.name}</span>
                  <span className="text-[11px] text-muted-foreground">{r.is_default ? "default" : r.level}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
