import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inviteSchema = z.object({
  email: z.string().email(),
  full_name: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  role: z.string(),
});

/**
 * Admin-only: insert an invite row (which the DB signup trigger honors) and send
 * a Supabase auth invite email so the recipient can accept in one click.
 */
export const sendInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => inviteSchema.parse(data))
  .handler(async ({ data, context }) => {
    // Verify caller is admin/super_admin via RLS-scoped client (not the admin client).
    const { data: roles, error: rolesErr } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (rolesErr) throw new Error(rolesErr.message);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin" || r.role === "super_admin");
    if (!isAdmin) throw new Error("Only admins can send invites");

    const email = data.email.trim().toLowerCase();

    // Insert / refresh invite row (idempotent-ish: upsert on email)
    const { error: invErr } = await context.supabase
      .from("invites")
      .insert({
        email,
        role: data.role as any,
        department: data.department || null,
        full_name: data.full_name || null,
        invited_by: context.userId,
      });
    if (invErr && !invErr.message.includes("duplicate")) {
      throw new Error(invErr.message);
    }

    // Send the auth invite email using the admin client (service role).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const redirectBase = process.env.SITE_URL || "https://hq.clovrlab.com";
    const { error: mailErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${redirectBase}/hq-login`,
      data: { full_name: data.full_name, department: data.department, role: data.role },
    });
    if (mailErr) {
      // Common case: user already exists — surface but don't hard-fail the invite row.
      return { ok: true, emailSent: false, warning: mailErr.message };
    }
    return { ok: true, emailSent: true };
  });
