import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AccessState = {
  loading: boolean;
  isAdmin: boolean;
  allowed: Set<string> | null; // null = unrestricted
  suspended: boolean;
};

/**
 * Resolves the current user's page access from the org permission engine:
 * default team role → assigned roles → per-person overrides. Admins are
 * unrestricted. Falls back to the legacy custom-role mapping if the RPC
 * returns nothing.
 */
export function useRouteAccess(): AccessState {
  const [state, setState] = useState<AccessState>({ loading: true, isAdmin: false, allowed: null, suspended: false });

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { if (alive) setState({ loading: false, isAdmin: false, allowed: new Set(), suspended: false }); return; }
      const uid = u.user.id;

      const [accessRes, legacy, suspRes] = await Promise.all([
        (supabase as any).rpc("my_access"),
        supabase.from("user_custom_roles").select("role_id, custom_roles(permissions)").eq("user_id", uid),
        supabase
          .from("hr_suspensions")
          .select("id, ends_at")
          .eq("user_id", uid)
          .eq("active", true)
          .lte("starts_at", new Date().toISOString())
          .limit(50),
      ]);

      const access = (accessRes?.data ?? null) as { is_admin: boolean; routes: string[] } | null;
      const legacyAdmin = ((legacy.data ?? []) as any[]).some((r) => r?.custom_roles?.permissions?.admin);
      const isAdmin = !!access?.is_admin || legacyAdmin;

      let allowed: Set<string> | null = null;
      if (!isAdmin) {
        const routes = access?.routes ?? [];
        allowed = new Set<string>([
          ...routes,
          // Communication baseline everyone gets.
          "/channels", "/dm", "/meetings", "/phone", "/meeting-notes",
        ]);
      }

      const now = Date.now();
      const suspended = ((suspRes.data ?? []) as any[]).some(
        (s) => !s.ends_at || new Date(s.ends_at).getTime() > now,
      );
      if (alive) setState({ loading: false, isAdmin, allowed, suspended });
    })();
    return () => { alive = false; };
  }, []);

  return state;
}
