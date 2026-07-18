import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export const sendEmailViaResend = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      from: string;
      to: string;
      cc?: string | null;
      subject: string;
      html?: string | null;
      text?: string | null;
      inReplyTo?: string | null;
      emailRowId?: string | null;
    }) => {
      if (!input.from || !input.to || !input.subject) {
        throw new Error("from, to, and subject are required");
      }
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    if (!lovableKey || !resendKey) {
      throw new Error("Email is not configured yet — Resend connection missing.");
    }

    const toList = data.to
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const ccList = (data.cc ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const body: Record<string, unknown> = {
      from: data.from,
      to: toList,
      subject: data.subject,
    };
    if (ccList.length) body.cc = ccList;
    if (data.html) body.html = data.html;
    if (data.text || !data.html) body.text = data.text ?? "";
    if (data.inReplyTo) {
      body.headers = { "In-Reply-To": data.inReplyTo, References: data.inReplyTo };
    }

    const response = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Resend] send failed [${response.status}]: ${errText}`);
      throw new Error(`Resend send failed [${response.status}]: ${errText}`);
    }

    const result = (await response.json()) as { id?: string };
    const messageId = result.id ?? null;

    // Best-effort: stamp the row with the provider message id
    if (data.emailRowId && messageId) {
      await context.supabase
        .from("hq_emails")
        .update({ message_id: messageId })
        .eq("id", data.emailRowId);
    }

    return { ok: true, messageId };
  });
