import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchApps, resolveAppSlug, type OrgApp } from "./apps";
import { applyAppTheme } from "./app-theme";
import { useRouteAccess } from "./route-access";


type AppState = {
  loading: boolean;
  slug: string;
  app: OrgApp | null;
  apps: OrgApp[];
  /** Apps the signed-in user is allowed to enter. */
  permitted: OrgApp[];
  /** True once we know the user may not enter the current app. */
  denied: boolean;
  unknown: boolean;
};

const Ctx = createContext<AppState>({
  loading: true, slug: "hq", app: null, apps: [], permitted: [], denied: false, unknown: false,
});

export function useCurrentApp() {
  return useContext(Ctx);
}

/** Can this user enter the app? Hub + admins always yes; otherwise needs a role in the division. */
export function canEnter(app: OrgApp, opts: { isAdmin: boolean; units: Set<string>; unitSlugById: Map<string, string> }) {
  if (opts.isAdmin) return true;
  if (app.is_hub || !app.org_unit_id) return true;
  const slug = opts.unitSlugById.get(app.org_unit_id);
  return !!slug && opts.units.has(slug);
}

export function CurrentAppProvider({ children }: { children: ReactNode }) {
  const access = useRouteAccess();
  const [apps, setApps] = useState<OrgApp[]>([]);
  const [unitSlugById, setUnitSlugById] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const slug = resolveAppSlug();

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await fetchApps();
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: units } = await (supabase as any).from("org_units").select("id, slug");
      if (!alive) return;
      setApps(list);
      setUnitSlugById(new Map(((units ?? []) as any[]).map((u) => [u.id, u.slug])));
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const app = apps.find((a) => a.slug === slug || a.subdomain === slug) ?? null;
  const hub = apps.find((a) => a.is_hub) ?? null;
  const ready = !loading && !access.loading;

  useEffect(() => { applyAppTheme(app ?? hub); }, [app?.id, hub?.id, app?.accent, app?.layout]);


  const opts = { isAdmin: access.isAdmin, units: access.units, unitSlugById };
  const permitted = apps.filter((a) => a.enabled && canEnter(a, opts));
  const denied = ready && !!app && (!app.enabled || !canEnter(app, opts));
  const unknown = ready && !app;

  return (
    <Ctx.Provider
      value={{ loading: !ready, slug, app: app ?? hub, apps, permitted, denied, unknown }}
    >
      {children}
    </Ctx.Provider>
  );
}
