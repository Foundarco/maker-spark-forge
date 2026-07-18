import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

// Resend inbound webhook.
// Configure in the Resend dashboard: Inbound → point to
//   https://<your-domain>/api/public/resend-inbound
// Sign with the RESEND_WEBHOOK_SECRET (Svix-style headers). The signing
// scheme below matches Resend's default (Svix: v1,base64(hmac_sha256)).
async function verifySignature(request: Request, rawBody: string): Promise<boolean> {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return true; // dev fallback — reject in prod by setting the secret
  const svixId = request.headers.get("svix-id") ?? request.headers.get("webhook-id");
  const svixTs = request.headers.get("svix-timestamp") ?? request.headers.get("webhook-timestamp");
  const svixSig = request.headers.get("svix-signature") ?? request.headers.get("webhook-signature");
  if (!svixId || !svixTs || !svixSig) return false;

  const signedPayload = `${svixId}.${svixTs}.${rawBody}`;
  const key = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice(6), "base64")
    : Buffer.from(secret);
  const expected = createHmac("sha256", key).update(signedPayload).digest("base64");

  return svixSig
    .split(" ")
    .some((entry) => {
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

export const Route = createFileRoute("/api/public/resend-inbound")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const ok = await verifySignature(request, raw);
        if (!ok) return new Response("Invalid signature", { status: 401 });

        let payload: any;
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        // Resend inbound event: { type: "email.inbound", data: { ... } }
        const evt = payload?.data ?? payload;
        const messageId: string | null = evt.message_id ?? evt.id ?? null;
        const fromAddr: string = evt.from ?? evt.envelope?.from ?? "";
        const toArr: string[] = Array.isArray(evt.to) ? evt.to : evt.to ? [evt.to] : evt.envelope?.to ?? [];
        const toAddr = toArr[0] ?? "";
        const cc = Array.isArray(evt.cc) ? evt.cc.join(", ") : evt.cc ?? null;
        const subject: string = evt.subject ?? "(no subject)";
        const html: string | null = evt.html ?? null;
        const text: string | null = evt.text ?? null;
        const inReplyTo: string | null = evt.in_reply_to ?? evt.headers?.["in-reply-to"] ?? null;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Dedupe by provider message id
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
          sent_at: new Date().toISOString(),
        } as any);

        if (error) {
          console.error("[Resend inbound] insert failed:", error);
          return new Response("Insert failed", { status: 500 });
        }
        return new Response("ok");
      },
    },
  },
});
