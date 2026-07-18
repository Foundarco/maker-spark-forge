import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

// Resend webhook — handles inbound receive + all delivery events.
// Configure ONE endpoint in the Resend dashboard pointed at:
//   https://<your-domain>/api/public/resend-inbound
// and subscribe to the events you care about (email.received,
// email.sent, email.delivered, email.bounced, email.opened,
// email.clicked, email.complained, email.delivery_delayed,
// email.failed, email.scheduled, email.suppressed).
async function verifySignature(request: Request, rawBody: string): Promise<boolean> {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return true; // dev fallback
  const svixId = request.headers.get("svix-id") ?? request.headers.get("webhook-id");
  const svixTs = request.headers.get("svix-timestamp") ?? request.headers.get("webhook-timestamp");
  const svixSig = request.headers.get("svix-signature") ?? request.headers.get("webhook-signature");
  if (!svixId || !svixTs || !svixSig) return false;

  const signedPayload = `${svixId}.${svixTs}.${rawBody}`;
  const key = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice(6), "base64")
    : Buffer.from(secret);
  const expected = createHmac("sha256", key).update(signedPayload).digest("base64");

  return svixSig.split(" ").some((entry) => {
    const [, value] = entry.split(",");
    if (!value) return false;
    const a = Buffer.from(value);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

function mailboxFor(to: string): string {
  const local = to.split("@")[0]?.toLowerCase() ?? "";
  if (["support", "help"].includes(local)) return "support";
  if (["sales", "hello"].includes(local)) return "sales";
  if (["billing", "accounting"].includes(local)) return "billing";
  if (["info", "contact"].includes(local)) return "info";
  return "personal";
}

function firstRecipient(evt: any): string {
  const to = evt.to ?? evt.envelope?.to;
  if (Array.isArray(to)) return to[0] ?? "";
  return to ?? "";
}

export const Route = createFileRoute("/api/public/resend-inbound")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        if (!(await verifySignature(request, raw))) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: any;
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const type: string = payload?.type ?? "unknown";
        const evt = payload?.data ?? payload;
        const occurredAt: string = payload?.created_at ?? new Date().toISOString();
        const messageId: string | null = evt.email_id ?? evt.message_id ?? evt.id ?? null;
        const recipient = firstRecipient(evt);
        const subject: string = evt.subject ?? "(no subject)";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Always log the raw event
        await supabaseAdmin.from("hq_email_events").insert({
          message_id: messageId,
          event_type: type,
          recipient,
          subject,
          payload: evt,
          occurred_at: occurredAt,
        } as any);

        // Inbound: create a new email row
        if (type === "email.received" || type === "email.inbound") {
          const fromAddr: string = evt.from ?? evt.envelope?.from ?? "";
          const toArr: string[] = Array.isArray(evt.to)
            ? evt.to
            : evt.to
              ? [evt.to]
              : (evt.envelope?.to ?? []);
          const toAddr = toArr[0] ?? "";
          const cc = Array.isArray(evt.cc) ? evt.cc.join(", ") : (evt.cc ?? null);
          const html: string | null = evt.html ?? null;
          const text: string | null = evt.text ?? null;
          const inReplyTo: string | null =
            evt.in_reply_to ?? evt.headers?.["in-reply-to"] ?? null;

          // Dedupe
          if (messageId) {
            const { data: existing } = await supabaseAdmin
              .from("hq_emails")
              .select("id")
              .eq("message_id", messageId)
              .maybeSingle();
            if (existing) return new Response("ok");
          }

          const { error } = await supabaseAdmin.from("hq_emails").insert({
            folder: "inbox",
            mailbox: mailboxFor(toAddr),
            subject,
            from_addr: fromAddr,
            to_addr: toAddr,
            cc,
            body: html ?? text,
            status: "unread",
            is_read: false,
            direction: "inbound",
            message_id: messageId,
            in_reply_to: inReplyTo,
            sent_at: occurredAt,
          } as any);
          if (error) {
            console.error("[Resend] inbound insert failed:", error);
            return new Response("Insert failed", { status: 500 });
          }
          return new Response("ok");
        }

        // Outbound event: update the matching outbound row (if we have one)
        if (!messageId) return new Response("ok");

        const { data: row } = await supabaseAdmin
          .from("hq_emails")
          .select("id, opens_count, clicks_count")
          .eq("message_id", messageId)
          .maybeSingle();

        const patch: Record<string, any> = {
          last_event: type,
          last_event_at: occurredAt,
        };

        switch (type) {
          case "email.scheduled":
            patch.status = "scheduled";
            patch.scheduled_at = occurredAt;
            break;
          case "email.sent":
            patch.status = "sent";
            patch.sent_at = occurredAt;
            break;
          case "email.delivered":
            patch.status = "delivered";
            patch.delivered_at = occurredAt;
            break;
          case "email.delivery_delayed":
            patch.status = "delayed";
            break;
          case "email.opened":
            patch.status = "opened";
            patch.opens_count = (row?.opens_count ?? 0) + 1;
            break;
          case "email.clicked":
            patch.status = "clicked";
            patch.clicks_count = (row?.clicks_count ?? 0) + 1;
            break;
          case "email.bounced":
            patch.status = "bounced";
            patch.bounced_at = occurredAt;
            break;
          case "email.complained":
            patch.status = "complained";
            patch.complained_at = occurredAt;
            break;
          case "email.failed":
            patch.status = "failed";
            break;
          case "email.suppressed":
            patch.status = "suppressed";
            break;
        }

        if (row) {
          await supabaseAdmin.from("hq_emails").update(patch as any).eq("id", row.id);
        }

        return new Response("ok");
      },
    },
  },
});
