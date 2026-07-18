import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { playSound } from "@/lib/hq/sounds";
import { bodyMentions } from "@/lib/hq/mentions";

/**
 * Site-wide sound effects + browser notifications. Subscribes to realtime
 * inserts on notifications, direct_messages, and channel_messages for the
 * current user. Silent for messages the user sent themselves.
 */
export function SoundNotifier() {
  useEffect(() => {
    let cancelled = false;
    let channels: ReturnType<typeof supabase.channel>[] = [];

    // Request notification permission once, on first user gesture
    const askPerm = () => {
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
      window.removeEventListener("click", askPerm);
      window.removeEventListener("keydown", askPerm);
    };
    window.addEventListener("click", askPerm, { once: true });
    window.addEventListener("keydown", askPerm, { once: true });

    const showNotif = (title: string, body?: string) => {
      if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.visibilityState !== "visible") {
        try { new Notification(title, { body: body?.slice(0, 200), silent: true }); } catch {}
      }
    };

    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid || cancelled) return;

      const notif = supabase
        .channel(`sfx:notif:${uid}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` }, (p: any) => {
          const row = p.new || {};
          playSound("notification");
          showNotif(row.title || "New notification", row.body || undefined);
        })
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
          // Mentioned? Louder sound + notification.
          const mentioned =
            (Array.isArray(row.mentions) && row.mentions.includes(uid)) ||
            bodyMentions(row.body, uid);
          if (mentioned) {
            playSound("notification");
            showNotif("You were mentioned", row.body);
          } else {
            playSound("message");
          }
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
