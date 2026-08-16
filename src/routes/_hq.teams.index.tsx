import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Network, Users } from "lucide-react";
import { loadOrg, buildTree, type OrgUnit, type OrgMember } from "@/lib/hq/org";

export const Route = createFileRoute("/_hq/teams/")({
  head: () => ({ meta: [{ title: "Teams — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: TeamsIndex,
});

function TeamsIndex() {
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [people, setPeople] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrg().then((d) => { setUnits(d.units); setPeople(d.people); setLoading(false); });
  }, []);

  const tree = useMemo(() => buildTree(units), [units]);
  const divisions = tree.get(null) ?? [];
  const count = (id: string) => {
    const kids = (tree.get(id) ?? []).map((u) => u.id);
    return people.filter((p) => p.org_unit_id === id || kids.includes(p.org_unit_id ?? "")).length;
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Network className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Organization</p>
          <h1 className="text-3xl font-semibold tracking-tight">Teams</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every division and team, with its own workspace, roles and members.</p>
        </div>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {divisions.map((d) => (
            <div key={d.id} className="rounded-xl border border-border bg-card p-4">
              <Link to="/teams/$slug" params={{ slug: d.slug }} className="text-base font-semibold hover:text-primary">{d.name}</Link>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="h-3 w-3" />{count(d.id)} people</p>
              {d.description && <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(tree.get(d.id) ?? []).map((t) => (
                  <Link key={t.id} to="/teams/$slug" params={{ slug: t.slug }}
                    className="rounded-full bg-muted px-2.5 py-1 text-[11px] hover:bg-primary/10 hover:text-primary">{t.name}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
