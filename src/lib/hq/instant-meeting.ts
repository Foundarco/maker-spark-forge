import { supabase } from "@/integrations/supabase/client";

/** Create an ad-hoc meeting and return its id. Returns null on failure. */
export async function createInstantMeeting(title: string, inviteeIds: string[] = []): Promise<string | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const me = u.user.id;
  const now = new Date();
  const ends = new Date(now.getTime() + 60 * 60 * 1000);
  const { data, error } = await supabase
    .from("meetings")
    .insert({
      title: title || "Instant meeting",
      description: null,
      host_id: me,
      starts_at: now.toISOString(),
      ends_at: ends.toISOString(),
    } as any)
    .select()
    .single();
  if (error || !data) return null;
  const ids = Array.from(new Set([me, ...inviteeIds]));
  await supabase.from("meeting_participants").upsert(
    ids.map((uid) => ({ meeting_id: (data as any).id, user_id: uid, rsvp: uid === me ? "yes" : "invited" })),
    { onConflict: "meeting_id,user_id" } as any,
  );
  return (data as any).id as string;
}
