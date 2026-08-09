import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MailAccountInput = {
  id?: string | null;
  label: string;
  email_address: string;
  display_name?: string | null;
  imap_host: string;
  imap_port: number;
  smtp_host: string;
  smtp_port: number;
  username: string;
  password?: string | null;
  is_shared: boolean;
  active: boolean;
  assigned_user_id?: string | null;
};

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => r.role);
  if (!roles.includes("admin") && !roles.includes("super_admin")) {
    throw new Error("Only administrators can manage company mailboxes.");
  }
}

/** Create or update a mailbox. Admin only. */
export const saveMailAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: MailAccountInput) => {
    if (!input.label || !input.email_address || !input.imap_host || !input.smtp_host || !input.username) {
      throw new Error("Label, address, IMAP host, SMTP host and username are required.");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { encryptMailPassword } = await import("./mail-crypto.server");

    const row = {
      label: data.label,
      email_address: data.email_address.trim().toLowerCase(),
      display_name: data.display_name ?? null,
      imap_host: data.imap_host.trim(),
      imap_port: data.imap_port || 993,
      smtp_host: data.smtp_host.trim(),
      smtp_port: data.smtp_port || 465,
      username: data.username.trim(),
      is_shared: data.is_shared,
      active: data.active,
      assigned_user_id: data.assigned_user_id || null,
      created_by: context.userId,
    };

    let accountId = data.id ?? null;
    if (accountId) {
      const { error } = await supabaseAdmin.from("email_accounts").update(row).eq("id", accountId);
      if (error) throw new Error(error.message);
    } else {
      const { data: created, error } = await supabaseAdmin.from("email_accounts").insert(row).select("id").single();
      if (error) throw new Error(error.message);
      accountId = created.id;
    }

    if (data.password) {
      const { error } = await supabaseAdmin.from("email_account_secrets").upsert(
        { account_id: accountId, password_ciphertext: encryptMailPassword(data.password), updated_at: new Date().toISOString() },
        { onConflict: "account_id" },
      );
      if (error) throw new Error(error.message);
    }

    return { ok: true, id: accountId };
  });

export const deleteMailAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("email_accounts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

async function loadAccount(supabase: any, userId: string, accountId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { decryptMailPassword } = await import("./mail-crypto.server");

  // RLS-scoped read decides whether this user may use the mailbox at all.
  const { data: allowed } = await supabase
    .from("email_accounts")
    .select("id")
    .eq("id", accountId)
    .maybeSingle();
  if (!allowed) throw new Error("You do not have access to this mailbox.");

  const { data: account, error } = await supabaseAdmin
    .from("email_accounts")
    .select("*")
    .eq("id", accountId)
    .maybeSingle();
  if (error || !account) throw new Error("Mailbox not found.");

  const { data: secret } = await supabaseAdmin
    .from("email_account_secrets")
    .select("password_ciphertext")
    .eq("account_id", accountId)
    .maybeSingle();
  if (!secret) throw new Error("This mailbox has no password saved yet. Ask an admin to set it.");

  return { account, password: decryptMailPassword(secret.password_ciphertext), supabaseAdmin, userId };
}

/** Pull the newest messages from the mailbox over IMAP into the HQ inbox. */
export const syncMailAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { accountId: string; limit?: number }) => input)
  .handler(async ({ data, context }) => {
    const { account, password, supabaseAdmin } = await loadAccount(context.supabase, context.userId, data.accountId);
    const { ImapClient } = await import("./imap.server");

    const client = new ImapClient();
    try {
      await client.connect({
        host: account.imap_host,
        port: account.imap_port,
        username: account.username,
        password,
      });
      await client.selectMailbox("INBOX");
      const uids = await client.recentUids(Math.min(data.limit ?? 25, 50));

      let imported = 0;
      for (const uid of uids) {
        const message = await client.fetchMessage(uid);
        if (!message) continue;
        const dedupeId = message.messageId ?? `${account.email_address}:${uid}`;
        const { data: existing } = await supabaseAdmin
          .from("hq_emails")
          .select("id")
          .eq("message_id", dedupeId)
          .maybeSingle();
        if (existing) continue;

        await supabaseAdmin.from("hq_emails").insert({
          folder: "inbox",
          mailbox: account.email_address,
          direction: "inbound",
          subject: message.subject,
          from_addr: message.from,
          to_addr: message.to ?? account.email_address,
          cc: message.cc,
          body: message.body,
          message_id: dedupeId,
          sent_at: message.date ? new Date(message.date).toISOString() : new Date().toISOString(),
          owner_id: account.assigned_user_id,
          is_read: false,
          status: "unread",
        });
        imported += 1;
      }

      await supabaseAdmin
        .from("email_accounts")
        .update({ last_sync_at: new Date().toISOString(), last_sync_error: null })
        .eq("id", account.id);

      return { ok: true, imported, scanned: uids.length };
    } catch (err) {
      const messageText = err instanceof Error ? err.message : String(err);
      await supabaseAdmin
        .from("email_accounts")
        .update({ last_sync_at: new Date().toISOString(), last_sync_error: messageText.slice(0, 500) })
        .eq("id", account.id);
      throw new Error(messageText);
    } finally {
      await client.close();
    }
  });

/** Send a message through the mailbox's SMTP server. */
export const sendMailViaAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      accountId: string;
      to: string;
      cc?: string | null;
      subject: string;
      body: string;
      html?: string | null;
      inReplyTo?: string | null;
    }) => {
      if (!input.accountId || !input.to || !input.subject) {
        throw new Error("Mailbox, recipient and subject are required.");
      }
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const { account, password, supabaseAdmin } = await loadAccount(context.supabase, context.userId, data.accountId);
    const { sendSmtpMail } = await import("./smtp.server");

    const split = (value?: string | null) =>
      (value ?? "").split(",").map((s) => s.trim()).filter(Boolean);

    const { messageId } = await sendSmtpMail(
      { host: account.smtp_host, port: account.smtp_port, username: account.username, password },
      {
        from: account.email_address,
        fromName: account.display_name,
        to: split(data.to),
        cc: split(data.cc),
        subject: data.subject,
        text: data.body,
        html: data.html ?? undefined,
        inReplyTo: data.inReplyTo ?? null,
      },
    );

    await supabaseAdmin.from("hq_emails").insert({
      folder: "sent",
      mailbox: account.email_address,
      direction: "outbound",
      subject: data.subject,
      from_addr: account.email_address,
      to_addr: data.to,
      cc: data.cc ?? null,
      body: data.body,
      message_id: messageId,
      in_reply_to: data.inReplyTo ?? null,
      sent_at: new Date().toISOString(),
      status: "sent",
      is_read: true,
      owner_id: context.userId,
      created_by: context.userId,
    });

    return { ok: true, messageId };
  });

/** Verify IMAP + SMTP credentials without sending anything. */
export const testMailAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { accountId: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { account, password } = await loadAccount(context.supabase, context.userId, data.accountId);
    const { ImapClient } = await import("./imap.server");
    const client = new ImapClient();
    try {
      await client.connect({ host: account.imap_host, port: account.imap_port, username: account.username, password });
      await client.selectMailbox("INBOX");
      return { ok: true, message: "IMAP connection succeeded." };
    } finally {
      await client.close();
    }
  });
