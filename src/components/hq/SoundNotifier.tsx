import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { playSound } from "@/lib/hq/sounds";

/**
 * Site-wide sound effects. Subscribes to realtime inserts on
 * notifications, direct_messages, and channel_messages for the current
 * user and plays a short tone. Silent for messages the user sent.
 */
export function SoundNotifier() {
  useEffect(() => {
    let cancelled = false;
    let channels: ReturnType<typeof supabase.channel>[] = [];
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid || cancelled) return;

      const notif = supabase
        .channel(`sfx:notif:${uid}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` }, () => playSound("notification"))
        .subscribe();

      const dm = supabase
        .channel(`sfx:dm:${uid}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, (p: any) => {
          const row = p.new || {};
          if (row.sender_id === uid) return;
          if (row.recipient_id && row.recipient_id !== uid) return;
          playSound("message");
        })
        .subscribe();

      const ch = supabase
        .channel(`sfx:ch:${uid}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "channel_messages" }, (p: any) => {
          const row = p.new || {};
          if (row.author_id === uid || row.user_id === uid || row.sender_id === uid) return;
          playSound("message");
        })
        .subscribe();

      channels = [notif, dm, ch];
    })();
    return () => {
      cancelled = true;
      channels.forEach((c) => supabase.removeChannel(c));
    };
  }, []);
  return null;
}
