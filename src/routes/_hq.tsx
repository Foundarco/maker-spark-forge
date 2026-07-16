import { createFileRoute, redirect } from "@tanstack/react-router";
import { HQShell } from "@/components/hq/HQShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_hq")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/hq-login" });
    }
    return { userId: data.user.id };
  },
  component: HQShell,
});
