import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Inbox, Plus, Trash2, RefreshCw, Check, X, Loader2 } from "lucide-react";
import {
  saveMailAccount,
  deleteMailAccount,
  testMailAccount,
  type MailAccountInput,
} from "@/lib/hq/mail-accounts.functions";

type Account = {
  id: string;
  label: string;
  email_address: string;
  display_name: string | null;
  imap_host: string;
  imap_port: number;
  smtp_host: string;
  smtp_port: number;
  username: string;
  is_shared: boolean;
  active: boolean;
  assigned_user_id: string | null;
  last_sync_at: string | null;
  last_sync_error: string | null;
};

const EMPTY: MailAccountInput = {
  label: "",
  email_address: "",
  display_name: "",
  imap_host: "",
  imap_port: 993,
  smtp_host: "",
  smtp_port: 465,
  username: "",
  password: "",
  is_shared: true,
  active: true,
  assigned_user_id: null,
};

export function MailboxesAdmin() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [people, setPeople] = useState<Array<{ id: string; full_name: string | null; email: string | null }>>([]);
  const [form, setForm] = useState<MailAccountInput | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const save = useServerFn(saveMailAccount);
  const remove = useServerFn(deleteMailAccount);
  const test = useServerFn(testMailAccount);

  const load = async () => {
    const { data } = await supabase.from("email_accounts").select("*").order("label");
    setAccounts((data ?? []) as Account[]);
  };

  useEffect(() => {
    load();
    (async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, email").order("full_name");
      setPeople(data ?? []);
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setMessage(null);
    try {
      await save({ data: form });
      setForm(null);
      await load();
      setMessage({ kind: "ok", text: "Mailbox saved." });
    } catch (err) {
      setMessage({ kind: "err", text: err instanceof Error ? err.message : "Could not save mailbox." });
    } finally {
      setBusy(false);
    }
  };

  const runTest = async (id: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await test({ data: { accountId: id } });
      setMessage({ kind: "ok", text: res.message });
    } catch (err) {
      setMessage({ kind: "err", text: err instanceof Error ? err.message : "Connection failed." });
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Company mailboxes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect real IMAP/SMTP mailboxes (Namecheap Private Email, Google Workspace app passwords, or any provider).
              Shared mailboxes are visible to all staff; assigned mailboxes only to their owner.
            </p>
          </div>
          <button
            onClick={() => setForm({ ...EMPTY })}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add mailbox
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 rounded-md px-3 py-2 text-sm ${
              message.kind === "ok" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
            }`}
          >
            {message.text}
          </div>
        )}

        {accounts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
            <Inbox className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No mailboxes connected yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {accounts.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {a.label}{" "}
                    <span className="font-normal text-muted-foreground">— {a.email_address}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    IMAP {a.imap_host}:{a.imap_port} · SMTP {a.smtp_host}:{a.smtp_port} ·{" "}
                    {a.is_shared ? "Shared" : "Assigned"} · {a.active ? "Active" : "Paused"}
                    {a.last_sync_at ? ` · Synced ${new Date(a.last_sync_at).toLocaleString()}` : ""}
                  </p>
                  {a.last_sync_error && (
                    <p className="mt-0.5 text-xs text-destructive">Last error: {a.last_sync_error}</p>
                  )}
                </div>
                <button
                  onClick={() => runTest(a.id)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Test
                </button>
                <button
                  onClick={() => setForm({ ...a, password: "" })}
                  className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  Edit
                </button>
                <button
                  aria-label={`Delete ${a.label}`}
                  onClick={async () => {
                    if (!confirm(`Delete mailbox ${a.email_address}?`)) return;
                    await remove({ data: { id: a.id } });
                    load();
                  }}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setForm(null)}>
          <form
            role="dialog"
            aria-modal="true"
            aria-label="Mailbox settings"
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{form.id ? "Edit mailbox" : "Add mailbox"}</h3>
              <button type="button" aria-label="Close" onClick={() => setForm(null)} className="rounded-md p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium">Label</span>
                <input required className={input} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Support inbox" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">Email address</span>
                <input required type="email" className={input} value={form.email_address} onChange={(e) => setForm({ ...form, email_address: e.target.value })} placeholder="support@company.com" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">Display name</span>
                <input className={input} value={form.display_name ?? ""} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="McGuire Construction" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">Login username</span>
                <input required className={input} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="support@company.com" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">IMAP host</span>
                <input required className={input} value={form.imap_host} onChange={(e) => setForm({ ...form, imap_host: e.target.value })} placeholder="mail.privateemail.com" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">IMAP port</span>
                <input required type="number" className={input} value={form.imap_port} onChange={(e) => setForm({ ...form, imap_port: Number(e.target.value) })} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">SMTP host</span>
                <input required className={input} value={form.smtp_host} onChange={(e) => setForm({ ...form, smtp_host: e.target.value })} placeholder="mail.privateemail.com" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">SMTP port (SSL)</span>
                <input required type="number" className={input} value={form.smtp_port} onChange={(e) => setForm({ ...form, smtp_port: Number(e.target.value) })} />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block font-medium">Password {form.id && <span className="font-normal text-muted-foreground">(leave blank to keep current)</span>}</span>
                <input type="password" className={input} value={form.password ?? ""} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="App password" autoComplete="new-password" />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block font-medium">Assigned to</span>
                <select
                  className={input}
                  value={form.assigned_user_id ?? ""}
                  onChange={(e) => setForm({ ...form, assigned_user_id: e.target.value || null })}
                >
                  <option value="">Nobody (shared team mailbox)</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_shared} onChange={(e) => setForm({ ...form, is_shared: e.target.checked })} />
                Visible to all staff
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Active
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                Cancel
              </button>
              <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save mailbox
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
