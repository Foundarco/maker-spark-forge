import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export type OrgApp = {
  id: string;
  slug: string;
  subdomain: string;
  label: string;
  tagline: string | null;
  icon: string | null;
  org_unit_id: string | null;
  landing_route: string;
  nav_groups: string[];
  enabled: boolean;
  is_hub: boolean;
  sort_order: number;
};

export const APP_OVERRIDE_KEY = "hq.app.override";

/** Hostnames that never carry a team subdomain (previews, local dev, apex). */
const NEUTRAL_HOSTS = [/\.lovable\.app$/, /\.lovableproject\.com$/, /^localhost$/, /^127\./];

/**
 * Resolves which team app the browser is currently pointed at.
 * Real deployments use the first hostname label (eng.clovrlab.com -> "eng").
 * Preview/local hosts have no subdomain, so `?app=eng` (sticky) is used instead.
 */
export function resolveAppSlug(): string {
  if (typeof window === "undefined") return "hq";
  const { hostname, search } = window.location;

  const param = new URLSearchParams(search).get("app");
  if (param) {
    try { localStorage.setItem(APP_OVERRIDE_KEY, param); } catch {}
    return param;
  }

  const neutral = NEUTRAL_HOSTS.some((re) => re.test(hostname));
  if (!neutral) {
    const parts = hostname.split(".");
    if (parts.length >= 3) {
      const label = parts[0].toLowerCase();
      if (label !== "www") return label;
    }
    return "hq";
  }

  try {
    return localStorage.getItem(APP_OVERRIDE_KEY) || "hq";
  } catch {
    return "hq";
  }
}

/** Root domain used to build cross-app links (clovrlab.com). */
export function rootDomain(): string | null {
  if (typeof window === "undefined") return null;
  const { hostname } = window.location;
  if (NEUTRAL_HOSTS.some((re) => re.test(hostname))) return null;
  const parts = hostname.split(".");
  return parts.length >= 2 ? parts.slice(-2).join(".") : null;
}

/** Absolute URL for another app — real subdomain when possible, `?app=` fallback. */
export function appUrl(app: Pick<OrgApp, "subdomain" | "landing_route">): string {
  if (typeof window === "undefined") return app.landing_route;
  const root = rootDomain();
  if (root) return `${window.location.protocol}//${app.subdomain}.${root}${app.landing_route}`;
  return `${app.landing_route}?app=${encodeURIComponent(app.subdomain)}`;
}

export async function fetchApps(): Promise<OrgApp[]> {
  const { data } = await db.from("org_apps").select("*").order("sort_order");
  return (data ?? []) as OrgApp[];
}

export async function saveApp(app: Partial<OrgApp> & { id?: string }) {
  if (app.id) {
    const { id, ...rest } = app;
    return db.from("org_apps").update(rest).eq("id", id);
  }
  return db.from("org_apps").insert(app);
}

export async function deleteApp(id: string) {
  return db.from("org_apps").delete().eq("id", id);
}
