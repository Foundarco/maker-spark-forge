import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AccessState = {
  loading: boolean;
  isAdmin: boolean;
  allowed: Set<string> | null; // null = unrestricted
  suspended: boolean;
};

export function useRouteAccess(): AccessState {
  const [state, setState] = useState<AccessState>({ loading: true, isAdmin: false, allowed: null, suspended: false });

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { if (alive) setState({ loading: false, isAdmin: false, allowed: new Set(), suspended: false }); return; }
      const uid = u.user.id;
      const [sys, custom, suspRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", uid),
        supabase
          .from("user_custom_roles")
          .select("role_id, custom_roles(permissions)")
          .eq("user_id", uid),
        supabase
          .from("hr_suspensions")
          .select("id, ends_at")
          .eq("user_id", uid)
          .eq("active", true)
          .lte("starts_at", new Date().toISOString())
          .limit(50),
      ]);
      const sysRoles = (sys.data ?? []).map((r: any) => r.role);
      const isAdmin =
        sysRoles.includes("super_admin") ||
        sysRoles.includes("admin") ||
        ((custom.data ?? []) as any[]).some((r) => r?.custom_roles?.permissions?.admin);

      const roleIds = ((custom.data ?? []) as any[]).map((r) => r.role_id).filter(Boolean);
      let allowed: Set<string> | null = null;
      if (!isAdmin) {
        if (roleIds.length === 0) {
          // Base employee with no custom roles → communication-only.
          allowed = new Set<string>(["/channels", "/dm", "/meetings", "/phone", "/meeting-notes"]);
        } else {
          const { data: routes } = await supabase
            .from("role_route_access")
            .select("route")
            .in("role_id", roleIds);
          allowed = new Set((routes ?? []).map((r: any) => r.route));
        }
      }
      if (alive) setState({ loading: false, isAdmin, allowed, suspended: !!suspRes.data });
    })();
    return () => { alive = false; };
  }, []);

  return state;
}
