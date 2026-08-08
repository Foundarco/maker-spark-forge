import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const lookupSchema = z.object({
  token: z.string().min(8).max(200),
  meetingId: z.string().uuid(),
});

const joinSchema = z.object({
  token: z.string().min(8).max(200),
  meetingId: z.string().uuid(),
  name: z.string().trim().min(1).max(120).nullable().optional(),
});

/** Resolve a guest meeting invite from its token. Returns null when the token is invalid. */
export const lookupMeetingInvite = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => lookupSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("meeting_external_invites")
      .select("id, email, name")
      .eq("token", data.token)
      .eq("meeting_id", data.meetingId)
      .maybeSingle();
    if (error) throw error;
    if (!row) return null;
    return { id: row.id as string, email: row.email as string | null, name: row.name as string | null };
  });

/** Mark a guest invite as joined, optionally recording the guest's display name. */
export const markMeetingInviteJoined = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => joinSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: { joined_at: string; name?: string } = { joined_at: new Date().toISOString() };
    if (data.name) patch.name = data.name;
    const { error } = await supabaseAdmin
      .from("meeting_external_invites")
      .update(patch)
      .eq("token", data.token)
      .eq("meeting_id", data.meetingId);
    if (error) throw error;
    return { ok: true };
  });
