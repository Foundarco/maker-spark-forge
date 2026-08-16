import { supabase } from "@/integrations/supabase/client";
import { navGroups } from "@/components/hq/nav-config";

const db = supabase as any;

export type OrgUnit = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  kind: string;
  description: string | null;
  lead_id: string | null;
  sort_order: number;
};

export type OrgRole = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  org_unit_id: string | null;
  kind: string;
  level: string;
  color: string | null;
  is_default: boolean;
  position: number;
};

export type OrgMember = {
  id: string;
  full_name: string | null;
  email: string | null;
  title: string | null;
  org_unit_id: string | null;
};

/** Every page in the app that can be permissioned, grouped for the matrix UI. */
export const ROUTE_CATALOG = navGroups.map((g) => ({
  label: g.label,
  routes: g.items.map((i) => ({ to: i.to, label: i.label })),
}));

export const ALL_ROUTES = Array.from(
  new Set(navGroups.flatMap((g) => g.items.map((i) => i.to))),
);

export async function loadOrg() {
  const [units, roles, routes, people] = await Promise.all([
    db.from("org_units").select("*").order("sort_order"),
    db.from("org_roles").select("*").order("position"),
    db.from("org_role_routes").select("role_id, route"),
    db.from("profiles").select("id, full_name, email, title, org_unit_id").order("full_name"),
  ]);
  return {
    units: (units.data ?? []) as OrgUnit[],
    roles: (roles.data ?? []) as OrgRole[],
    routes: (routes.data ?? []) as { role_id: string; route: string }[],
    people: (people.data ?? []) as OrgMember[],
  };
}

export function buildTree(units: OrgUnit[]) {
  const byParent = new Map<string | null, OrgUnit[]>();
  for (const u of units) {
    const key = u.parent_id;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(u);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.sort_order - b.sort_order);
  return byParent;
}

export async function setRoleRoute(roleId: string, route: string, on: boolean) {
  if (on) {
    await db.from("org_role_routes").upsert({ role_id: roleId, route }, { onConflict: "role_id,route" });
  } else {
    await db.from("org_role_routes").delete().eq("role_id", roleId).eq("route", route);
  }
}

export async function assignUserUnit(userId: string, unitId: string | null) {
  await db.from("profiles").update({ org_unit_id: unitId }).eq("id", userId);
  await db.from("hr_employees").update({ org_unit_id: unitId }).eq("user_id", userId);
}

export async function setUserRole(userId: string, roleId: string, on: boolean) {
  if (on) {
    await db.from("user_org_roles").upsert({ user_id: userId, role_id: roleId }, { onConflict: "user_id,role_id" });
  } else {
    await db.from("user_org_roles").delete().eq("user_id", userId).eq("role_id", roleId);
  }
}

export async function setUserOverride(userId: string, route: string, granted: boolean | null) {
  if (granted === null) {
    await db.from("user_route_overrides").delete().eq("user_id", userId).eq("route", route);
  } else {
    await db
      .from("user_route_overrides")
      .upsert({ user_id: userId, route, granted }, { onConflict: "user_id,route" });
  }
}

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}
