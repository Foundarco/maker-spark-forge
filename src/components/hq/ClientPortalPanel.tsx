import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createPortalUser, setPortalUserStatus } from "@/lib/hq/portal.functions";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, UserPlus, ShieldOff, ShieldCheck, Copy } from "lucide-react";

type Row = Record<string, any>;

function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  return Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/** Staff-side management of client portal logins. */
export function ClientPortalPanel({ clientId }: { clientId: string }) {
  const create = useServerFn(createPortalUser);
  const setStatus = useServerFn(setPortalUserStatus);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: randomPassword() });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("con_client_portal_users").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [clientId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await create({ data: { clientId, email: form.email.trim(), fullName: form.fullName.trim(), password: form.password } });
      setNotice("Portal access created — share the temporary password with the client.");
      setOpen(false);
      setForm({ fullName: "", email: "", password: randomPassword() });
      load();
    } catch (err: any) {
      setNotice(err?.message ?? "Could not create portal access.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (row: Row) => {
    const next = row.status === "active" ? "revoked" : "active";
    try {
      await setStatus({ data: { id: row.id, status: next } });
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: next } : r)));
    } catch (err: any) {
      setNotice(err?.message ?? "Update failed.");
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Client portal access</h2>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground">
          <UserPlus className="h-3.5 w-3.5" /> Invite contact
        </button>
      </div>
      <div className="p-4">
        {notice && <p className="mb-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">{notice}</p>}
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
        ) : rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">No portal logins yet. Invite a contact so they can track their project at /client-login.</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.full_name || r.email}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${r.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>{r.status}</span>
                  <button onClick={() => toggle(r)} aria-label={r.status === "active" ? "Revoke access" : "Restore access"} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                    {r.status === "active" ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Invite portal contact" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
            <h3 className="text-sm font-semibold">Invite a client contact</h3>
            <p className="mt-1 text-xs text-muted-foreground">They'll sign in at /client-login with this email and temporary password.</p>
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-medium">Full name
                <input aria-label="Full name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </label>
              <label className="block text-xs font-medium">Email
                <input aria-label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </label>
              <label className="block text-xs font-medium">Temporary password
                <div className="mt-1 flex gap-2">
                  <input aria-label="Temporary password" required minLength={10} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm" />
                  <button type="button" aria-label="Copy password" onClick={() => { navigator.clipboard.writeText(form.password); setNotice("Password copied"); }} className="rounded-lg border border-border px-2.5 hover:bg-muted"><Copy className="h-3.5 w-3.5" /></button>
                </div>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs">Cancel</button>
              <button type="submit" disabled={busy} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50">{busy ? "Creating…" : "Create access"}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

/** Staff side of the client-facing message thread. */
export function ClientMessagesPanel({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.from("con_client_messages").select("*").eq("client_id", clientId).order("created_at", { ascending: true });
      if (!alive) return;
      setRows(data ?? []); setLoading(false);
    })();
    const ch = supabase
      .channel(`client-msgs-${clientId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "con_client_messages", filter: `client_id=eq.${clientId}` }, (p) => {
        setRows((prev) => (prev.some((r) => r.id === (p.new as any).id) ? prev : [...prev, p.new as Row]));
      })
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, [clientId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [rows.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    const { data: u } = await supabase.auth.getUser();
    const { data: prof } = u.user ? await supabase.from("profiles").select("full_name").eq("id", u.user.id).maybeSingle() : { data: null as any };
    setBody("");
    const { error } = await supabase.from("con_client_messages").insert({
      client_id: clientId,
      body: text,
      author_id: u.user?.id ?? null,
      author_name: prof?.full_name ?? null,
      from_client: false,
    });
    if (error) setErr(error.message);
  };

  return (
    <div className="flex h-[calc(100vh-13rem)] flex-col rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-2.5">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Client messages · {clientName}</h2>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-xs text-muted-foreground">No messages with this client yet.</p>
        ) : rows.map((m) => (
          <div key={m.id} className={`flex ${m.from_client ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${m.from_client ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p className={`mt-1 text-[10px] ${m.from_client ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                {m.from_client ? clientName : m.author_name || "Clovr Labs team"} · {new Date(m.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {err && <p className="border-t border-border px-4 py-2 text-xs text-destructive">{err}</p>}
      <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
        <input aria-label="Message to client" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Reply to the client…" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <button type="submit" disabled={!body.trim()} aria-label="Send message" className="rounded-lg bg-primary p-2 text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button>
      </form>
    </div>
  );
}
