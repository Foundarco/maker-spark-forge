import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createSchema = z.object({
  clientId: z.string().uuid(),
  email: z.string().email().max(200),
  fullName: z.string().min(1).max(120),
  password: z.string().min(10).max(100),
});

async function assertEmployee(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).limit(5);
  if (!data || data.length === 0) throw new Error("Only staff can manage portal access.");
}

/** Creates a client-portal login for a contact at one client company. */
export const createPortalUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertEmployee(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, portal_client_id: data.clientId },
    });
    if (error) throw new Error(error.message);

    // Safety net in case the signup trigger did not run.
    await supabaseAdmin
      .from("con_client_portal_users")
      .upsert(
        {
          user_id: created.user!.id,
          client_id: data.clientId,
          full_name: data.fullName,
          email: data.email,
          status: "active",
          invited_by: context.userId,
        },
        { onConflict: "user_id,client_id" },
      );

    return { ok: true, userId: created.user!.id };
  });

const revokeSchema = z.object({ id: z.string().uuid(), status: z.enum(["active", "revoked"]) });

/** Enables or disables an existing portal login. */
export const setPortalUserStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => revokeSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertEmployee(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("con_client_portal_users")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
