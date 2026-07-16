import { supabase } from "@/integrations/supabase/client";

export type Permissions = {
  manage_channels: boolean;
  manage_roles: boolean;
  manage_messages: boolean;
  admin: boolean;
};

export type CustomRole = {
  id: string;
  name: string;
  color: string;
  position: number;
  permissions: Permissions;
};

const DEFAULT_PERMS: Permissions = {
  manage_channels: false,
  manage_roles: false,
  manage_messages: false,
  admin: false,
};

/** Fetch merged permissions for the current user across all assigned custom roles + super_admin bypass. */
export async function loadMyPermissions(userId: string): Promise<Permissions> {
  const [{ data: sysRoles }, { data: rows }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase.from("user_custom_roles").select("role_id, custom_roles(permissions)").eq("user_id", userId),
  ]);
  const sys = (sysRoles ?? []).map((r: any) => r.role);
  if (sys.includes("super_admin") || sys.includes("admin")) {
    return { manage_channels: true, manage_roles: true, manage_messages: true, admin: true };
  }
  const merged: Permissions = { ...DEFAULT_PERMS };
  for (const row of (rows ?? []) as any[]) {
    const perms = row?.custom_roles?.permissions ?? {};
    if (perms.admin) return { manage_channels: true, manage_roles: true, manage_messages: true, admin: true };
    merged.manage_channels ||= !!perms.manage_channels;
    merged.manage_roles ||= !!perms.manage_roles;
    merged.manage_messages ||= !!perms.manage_messages;
  }
  return merged;
}

export async function loadUserRoles(userId: string): Promise<CustomRole[]> {
  const { data } = await supabase
    .from("user_custom_roles")
    .select("custom_roles(id, name, color, position, permissions)")
    .eq("user_id", userId);
  return ((data ?? []) as any[])
    .map((r) => r.custom_roles)
    .filter(Boolean)
    .sort((a, b) => b.position - a.position);
}
