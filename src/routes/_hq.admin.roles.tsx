import { createFileRoute, redirect } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/_hq/admin/roles")({
  head: () => ({ meta: [{ title: "Roles — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/hq-login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    const rs = (roles ?? []).map((r: any) => r.role);
    if (!(rs.includes("super_admin") || rs.includes("admin"))) throw redirect({ to: "/dashboard" });
  },
  component: () => (
    <ModulePlaceholder
      title="Roles & Permissions"
      group="Administration"
      icon={Shield}
      description="Assign roles per user, manage role-based permissions, and grant per-department access."
    />
  ),
});
