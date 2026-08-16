import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { navGroups } from "@/components/hq/nav-config";
import { fetchApps, saveApp, deleteApp, appUrl, rootDomain, type OrgApp } from "@/lib/hq/apps";
import { loadSlackSettings, saveSlackSettings, type SlackSettings } from "@/lib/hq/slack";
import { useRouteAccess } from "@/lib/hq/route-access";
import { Grip, Plus, Trash2, ExternalLink, Save, Slack, Globe } from "lucide-react";

export const Route = createFileRoute("/_hq/admin/apps")({
  head: () => ({
    meta: [
      { title: "Team Apps — Clovr HQ" },
      { name: "description", content: "Manage per-team workspaces, their subdomains and Slack links." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppsAdmin,
});

type Unit = { id: string; name: string; slug: string; kind: string };

function AppsAdmin() {
  const access = useRouteAccess();
  const [apps, setApps] = useState<OrgApp[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [slack, setSlack] = useState<SlackSettings>({ workspaceUrl: "", channels: {} });
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const [list, { data: u }, s] = await Promise.all([
      fetchApps(),
      (supabase as any).from("org_units").select("id, name, slug, kind").order("sort_order"),
      loadSlackSettings(),
    ]);
    setApps(list);
    setUnits((u ?? []) as Unit[]);
    setSlack(s);
  };

  useEffect(() => { reload(); }, []);

  const divisions = useMemo(() => units.filter((u) => u.kind === "division"), [units]);
  const groupLabels = useMemo(() => navGroups.map((g) => g.label), []);
  const domain = rootDomain();

  const patch = (id: string, changes: Partial<OrgApp>) =>
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));

  const persist = async (app: OrgApp) => {
    setBusy(true);
    await saveApp({
      id: app.id,
      slug: app.slug,
      subdomain: app.subdomain.trim().toLowerCase(),
      label: app.label,
      tagline: app.tagline,
      org_unit_id: app.org_unit_id,
      landing_route: app.landing_route,
      nav_groups: app.nav_groups,
      enabled: app.enabled,
      sort_order: app.sort_order,
    });
    setBusy(false);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  const addApp = async () => {
    const n = apps.length;
    await saveApp({
      slug: `team-${n + 1}`,
      subdomain: `team${n + 1}`,
      label: "New workspace",
      tagline: "",
      landing_route: "/dashboard",
      nav_groups: ["Core"],
      enabled: false,
      sort_order: n + 10,
    } as any);
    reload();
  };

  const remove = async (app: OrgApp) => {
    if (app.is_hub) return;
    if (!confirm(`Delete the ${app.label} workspace?`)) return;
    await deleteApp(app.id);
    reload();
  };

  const saveSlack = async () => {
    setBusy(true);
    await saveSlackSettings(slack);
    setBusy(false);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  if (!access.loading && !access.isAdmin) {
    return <div className="p-8 text-sm text-muted-foreground">Only administrators can manage team apps.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold"><Grip className="h-5 w-5 text-primary" /> Team apps</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Each workspace is served from its own subdomain and shows only its own sections.
            {domain ? ` Point DNS for each subdomain at ${domain}.` : " On preview links, add ?app=<subdomain> to test a workspace."}
          </p>
        </div>
        <button onClick={addApp} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
          <Plus className="h-3.5 w-3.5" /> New app
        </button>
      </header>

      {savedAt && <p className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600">Saved.</p>}

      <div className="space-y-4">
        {apps.map((app) => (
          <section key={app.id} className="rounded-xl border border-border bg-card">
            <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
              <input
                value={app.label}
                onChange={(e) => patch(app.id, { label: e.target.value })}
                className="min-w-[10rem] flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm font-semibold outline-none focus:border-primary"
              />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                <input
                  value={app.subdomain}
                  onChange={(e) => patch(app.id, { subdomain: e.target.value })}
                  className="w-28 rounded-md border border-border bg-background px-2 py-1 font-mono text-xs outline-none focus:border-primary"
                />
                {domain && <span className="font-mono">.{domain}</span>}
              </div>
              <label className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" checked={app.enabled} onChange={(e) => patch(app.id, { enabled: e.target.checked })} />
                Live
              </label>
              <a href={appUrl(app)} target="_blank" rel="noopener" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Open workspace">
                <ExternalLink className="h-4 w-4" />
              </a>
              <button onClick={() => persist(app)} disabled={busy} className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs text-primary-foreground disabled:opacity-50">
                <Save className="h-3.5 w-3.5" /> Save
              </button>
              {!app.is_hub && (
                <button onClick={() => remove(app)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-red-500" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid gap-4 px-5 py-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tagline</label>
                <input
                  value={app.tagline ?? ""}
                  onChange={(e) => patch(app.id, { tagline: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Division</label>
                <select
                  value={app.org_unit_id ?? ""}
                  onChange={(e) => patch(app.id, { org_unit_id: e.target.value || null })}
                  disabled={app.is_hub}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary disabled:opacity-60"
                >
                  <option value="">Everyone (shared)</option>
                  {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Landing page</label>
                <input
                  value={app.landing_route}
                  onChange={(e) => patch(app.id, { landing_route: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="md:col-span-3">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sidebar sections</label>
                <div className="flex flex-wrap gap-1.5">
                  {groupLabels.map((g) => {
                    const on = app.nav_groups.includes(g);
                    return (
                      <button
                        key={g}
                        onClick={() =>
                          patch(app.id, {
                            nav_groups: on ? app.nav_groups.filter((x) => x !== g) : [...app.nav_groups, g],
                          })
                        }
                        className={`rounded-full px-3 py-1 text-xs transition ${
                          on ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <Slack className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Slack</h2>
          <span className="text-xs text-muted-foreground">internal chat lives here now</span>
        </div>
        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace URL</label>
            <input
              value={slack.workspaceUrl}
              onChange={(e) => setSlack({ ...slack, workspaceUrl: e.target.value })}
              placeholder="https://clovrlabs.slack.com"
              className="w-full max-w-md rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Channel per division</label>
            <div className="grid gap-2 md:grid-cols-2">
              {divisions.map((d) => (
                <div key={d.id} className="flex items-center gap-2">
                  <span className="w-44 truncate text-xs text-muted-foreground">{d.name}</span>
                  <input
                    value={slack.channels[d.slug] ?? ""}
                    onChange={(e) => setSlack({ ...slack, channels: { ...slack.channels, [d.slug]: e.target.value } })}
                    placeholder="#engineering"
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
          </div>
          <button onClick={saveSlack} disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50">
            <Save className="h-3.5 w-3.5" /> Save Slack settings
          </button>
        </div>
      </section>
    </div>
  );
}
