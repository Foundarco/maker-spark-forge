import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Inbox, Send, FileEdit, Archive, Flag, Trash2, Users, Filter, FileText,
  Search, Plus, Reply, ReplyAll, Forward, Star, Paperclip, X, ChevronRight, MailOpen, Circle, Settings as SettingsIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { sendEmailViaResend } from "@/lib/hq/mail.functions";

const DEFAULT_FROM_DOMAIN = "clovrlab.com";
const MAILBOX_FROM: Record<string, string> = {
  personal: `hq@${DEFAULT_FROM_DOMAIN}`,
  support: `support@${DEFAULT_FROM_DOMAIN}`,
  sales: `sales@${DEFAULT_FROM_DOMAIN}`,
  info: `info@${DEFAULT_FROM_DOMAIN}`,
  billing: `billing@${DEFAULT_FROM_DOMAIN}`,
};

export const Route = createFileRoute("/_hq/mail")({
  head: () => ({ meta: [{ title: "Mail — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: MailClient,
});

type Email = {
  id: string;
  folder: string;
  mailbox: string;
  subject: string | null;
  from_addr: string | null;
  to_addr: string | null;
  cc: string | null;
  bcc: string | null;
  body: string | null;
  status: string | null;
  is_read: boolean | null;
  sent_at: string | null;
  created_at: string;
};

type Rule = { id: string; name: string; match_field: string; match_value: string; action: string; action_value: string | null; active: boolean };
type Template = { id: string; name: string; category: string | null; subject: string | null; body: string | null };

type FolderKey =
  | { kind: "folder"; folder: string; mailbox?: string; label: string }
  | { kind: "flag"; label: string }
  | { kind: "shared"; mailbox: string; label: string }
  | { kind: "manage"; view: "rules" | "templates"; label: string };

const SHARED_BOXES = ["support", "sales", "info", "billing"];

function fmtDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const y = new Date(now.getTime() - 86400000);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString([], { month: "short", day: "numeric" });
  return d.toLocaleDateString();
}

function initials(addr: string | null) {
  if (!addr) return "?";
  const name = addr.split("@")[0].replace(/[._-]/g, " ");
  return name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
}

function MailClient() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [active, setActive] = useState<FolderKey>({ kind: "folder", folder: "inbox", mailbox: "personal", label: "Inbox" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [compose, setCompose] = useState<{ to: string; cc: string; subject: string; body: string; mailbox: string; inReplyTo?: string | null } | null>(null);
  const [sending, setSending] = useState(false);
  const sendFn = useServerFn(sendEmailViaResend);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<{ signature: string; auto_reply_enabled: boolean; auto_reply_subject: string; auto_reply_body: string; notify_on_new: boolean; notify_on_mention: boolean; digest_frequency: string; display_name: string }>({
    signature: "", auto_reply_enabled: false, auto_reply_subject: "", auto_reply_body: "", notify_on_new: true, notify_on_mention: true, digest_frequency: "off", display_name: "",
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("user_email_settings").select("*").eq("user_id", u.user.id).maybeSingle();
      if (data) setUserSettings({
        signature: data.signature ?? "",
        auto_reply_enabled: !!data.auto_reply_enabled,
        auto_reply_subject: data.auto_reply_subject ?? "",
        auto_reply_body: data.auto_reply_body ?? "",
        notify_on_new: data.notify_on_new ?? true,
        notify_on_mention: data.notify_on_mention ?? true,
        digest_frequency: data.digest_frequency ?? "off",
        display_name: data.display_name ?? "",
      });
    })();
  }, []);

  const saveUserSettings = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("user_email_settings").upsert({ user_id: u.user.id, ...userSettings, updated_at: new Date().toISOString() } as any);
    setShowSettings(false);
  };

  const refresh = async () => {
    setLoading(true);
    const [{ data: em }, { data: rl }, { data: tp }] = await Promise.all([
      supabase.from("hq_emails").select("*").order("created_at", { ascending: false }),
      supabase.from("hq_email_rules").select("*").order("created_at", { ascending: false }),
      supabase.from("hq_email_templates").select("*").order("updated_at", { ascending: false }),
    ]);
    setEmails((em ?? []) as Email[]);
    setRules((rl ?? []) as Rule[]);
    setTemplates((tp ?? []) as Template[]);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const counts = useMemo(() => {
    const c = { inbox: 0, unread: 0, sent: 0, drafts: 0, archived: 0, flagged: 0 } as Record<string, number>;
    for (const e of emails) {
      if (e.folder === "inbox" && e.mailbox === "personal") c.inbox++;
      if (e.folder === "inbox" && e.mailbox === "personal" && !e.is_read) c.unread++;
      if (e.folder === "sent") c.sent++;
      if (e.folder === "drafts") c.drafts++;
      if (e.status === "archived") c.archived++;
      if (e.status === "flagged") c.flagged++;
    }
    return c;
  }, [emails]);

  const sharedCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of emails) {
      if (SHARED_BOXES.includes(e.mailbox) && !e.is_read) map[e.mailbox] = (map[e.mailbox] ?? 0) + 1;
    }
    return map;
  }, [emails]);

  const listed = useMemo(() => {
    let rows = emails;
    if (active.kind === "folder") {
      rows = rows.filter((e) => e.folder === active.folder && (active.mailbox ? e.mailbox === active.mailbox : true));
    } else if (active.kind === "flag") {
      rows = rows.filter((e) => e.status === active.label.toLowerCase());
    } else if (active.kind === "shared") {
      rows = rows.filter((e) => e.mailbox === active.mailbox);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((e) =>
        (e.subject ?? "").toLowerCase().includes(q) ||
        (e.from_addr ?? "").toLowerCase().includes(q) ||
        (e.to_addr ?? "").toLowerCase().includes(q) ||
        (e.body ?? "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [emails, active, query]);

  const selected = useMemo(() => emails.find((e) => e.id === selectedId) ?? null, [emails, selectedId]);

  useEffect(() => {
    if (selected && !selected.is_read && active.kind === "folder" && active.folder === "inbox") {
      (async () => {
        await supabase.from("hq_emails").update({ is_read: true, status: "read" }).eq("id", selected.id);
        setEmails((prev) => prev.map((e) => e.id === selected.id ? { ...e, is_read: true, status: "read" } : e));
      })();
    }
  }, [selected?.id]);

  const openCompose = (init?: Partial<{ to: string; cc: string; subject: string; body: string; mailbox: string; inReplyTo: string | null }>) => {
    setCompose({
      to: init?.to ?? "",
      cc: init?.cc ?? "",
      subject: init?.subject ?? "",
      body: init?.body ?? "",
      mailbox: init?.mailbox ?? "personal",
      inReplyTo: init?.inReplyTo ?? null,
    });
  };

  const sendCompose = async (asDraft: boolean) => {
    if (!compose) return;
    if (sending) return;
    setSending(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const fromAddr = MAILBOX_FROM[compose.mailbox] ?? MAILBOX_FROM.personal;
      const row = {
        folder: asDraft ? "drafts" : "sent",
        mailbox: compose.mailbox,
        subject: compose.subject || "(no subject)",
        from_addr: asDraft ? (u.user?.email ?? fromAddr) : fromAddr,
        to_addr: compose.to,
        cc: compose.cc || null,
        body: compose.body || null,
        status: asDraft ? "draft" : "sent",
        is_read: true,
        direction: "outbound",
        in_reply_to: compose.inReplyTo ?? null,
        sent_at: asDraft ? null : new Date().toISOString(),
        owner_id: u.user?.id,
        created_by: u.user?.id,
      };
      const { data, error } = await supabase.from("hq_emails").insert(row as any).select().single();
      if (error) { alert(error.message); return; }
      const inserted = data as Email;

      if (!asDraft) {
        try {
          const bodyText = compose.body || "";
          const html = `<div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(bodyText)}</div>`;
          await sendFn({
            data: {
              from: fromAddr,
              to: compose.to,
              cc: compose.cc || null,
              subject: compose.subject || "(no subject)",
              html,
              text: bodyText,
              inReplyTo: compose.inReplyTo ?? null,
              emailRowId: inserted.id,
            },
          });
        } catch (err: any) {
          console.error(err);
          alert(`Saved to Sent, but delivery failed: ${err?.message ?? err}`);
        }
      }

      if (inserted) setEmails((prev) => [inserted, ...prev]);
      setCompose(null);
      setActive({ kind: "folder", folder: asDraft ? "drafts" : "sent", label: asDraft ? "Drafts" : "Sent" });
    } finally {
      setSending(false);
    }
  };

  function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
  }


  const setFlag = async (id: string, status: string) => {
    await supabase.from("hq_emails").update({ status }).eq("id", id);
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
  };

  const deleteEmail = async (id: string) => {
    if (!confirm("Delete this email?")) return;
    await supabase.from("hq_emails").delete().eq("id", id);
    setEmails((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const NavItem = ({ icon: Icon, label, count, isActive, onClick }: any) => (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left text-[13px] transition ${
        isActive ? "bg-primary/10 font-semibold text-primary" : "text-foreground/80 hover:bg-muted"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {count ? (
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{count}</span>
      ) : null}
    </button>
  );

  return (
    <div className="mx-auto flex h-full w-full max-w-[1600px] gap-3 p-3">
      {/* Left rail: folders */}
      <aside className="flex w-60 shrink-0 flex-col rounded-xl border border-border bg-card">
        <div className="border-b border-border p-3">
          <button
            onClick={() => openCompose()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> New email
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-2">
          <div>
            <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Personal</p>
            <NavItem icon={Inbox} label="Inbox" count={counts.unread} isActive={active.kind === "folder" && active.folder === "inbox" && active.mailbox === "personal"} onClick={() => setActive({ kind: "folder", folder: "inbox", mailbox: "personal", label: "Inbox" })} />
            <NavItem icon={Send} label="Sent" count={counts.sent} isActive={active.kind === "folder" && active.folder === "sent"} onClick={() => setActive({ kind: "folder", folder: "sent", label: "Sent" })} />
            <NavItem icon={FileEdit} label="Drafts" count={counts.drafts} isActive={active.kind === "folder" && active.folder === "drafts"} onClick={() => setActive({ kind: "folder", folder: "drafts", label: "Drafts" })} />
            <NavItem icon={Flag} label="Flagged" count={counts.flagged} isActive={active.kind === "flag" && active.label === "Flagged"} onClick={() => setActive({ kind: "flag", label: "Flagged" })} />
            <NavItem icon={Archive} label="Archived" count={counts.archived} isActive={active.kind === "flag" && active.label === "Archived"} onClick={() => setActive({ kind: "flag", label: "Archived" })} />
          </div>

          <div>
            <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Users className="h-3 w-3" /> Shared mailboxes</span>
            </p>
            {SHARED_BOXES.map((mb) => (
              <NavItem
                key={mb}
                icon={Inbox}
                label={`${mb}@`}
                count={sharedCounts[mb]}
                isActive={active.kind === "shared" && active.mailbox === mb}
                onClick={() => setActive({ kind: "shared", mailbox: mb, label: `${mb}@` })}
              />
            ))}
          </div>

          <div>
            <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Manage</p>
            <NavItem icon={Filter} label="Rules" count={rules.filter((r) => r.active).length} isActive={active.kind === "manage" && active.view === "rules"} onClick={() => setActive({ kind: "manage", view: "rules", label: "Rules" })} />
            <NavItem icon={FileText} label="Templates" count={templates.length} isActive={active.kind === "manage" && active.view === "templates"} onClick={() => setActive({ kind: "manage", view: "templates", label: "Templates" })} />
          </div>
        </div>
      </aside>

      {/* Middle: list OR manage view */}
      {active.kind !== "manage" ? (
        <section className="flex w-[380px] shrink-0 flex-col rounded-xl border border-border bg-card">
          <div className="border-b border-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{active.label}</h2>
              <span className="text-[11px] text-muted-foreground">{listed.length}</span>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search mail…" className="w-full rounded-md border border-border bg-background pl-7 pr-2 py-1.5 text-xs outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? <p className="p-4 text-xs text-muted-foreground">Loading…</p> : listed.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">No messages.</p>
            ) : listed.map((e) => {
              const isSel = selectedId === e.id;
              const unread = !e.is_read && e.folder === "inbox";
              const person = active.kind === "folder" && (active.folder === "sent" || active.folder === "drafts") ? e.to_addr : e.from_addr;
              return (
                <button key={e.id} onClick={() => setSelectedId(e.id)} className={`flex w-full gap-2.5 border-b border-border/60 px-3 py-2.5 text-left transition ${isSel ? "bg-primary/10" : "hover:bg-muted/50"}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${unread ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{initials(person)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-[13px] ${unread ? "font-bold" : "font-medium"}`}>{person || "—"}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{fmtDate(e.created_at)}</span>
                    </div>
                    <p className={`truncate text-[12px] ${unread ? "font-semibold text-foreground" : "text-foreground/80"}`}>{e.subject || "(no subject)"}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{e.body?.slice(0, 90) || "—"}</p>
                  </div>
                  {unread && <Circle className="mt-1 h-2 w-2 shrink-0 fill-primary text-primary" />}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Right: reader OR manage view */}
      <section className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
        {active.kind === "manage" ? (
          <ManageView view={active.view} rules={rules} templates={templates} onRefresh={refresh} onUseTemplate={(t) => openCompose({ subject: t.subject ?? "", body: t.body ?? "" })} />
        ) : !selected ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <MailOpen className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p>Select a message to read.</p>
          </div>
        ) : (
          <>
            <header className="border-b border-border px-6 py-4">
              <div className="mb-3 flex items-center gap-2">
                <button onClick={() => openCompose({ to: selected.from_addr ?? "", subject: `Re: ${selected.subject ?? ""}`, body: `\n\n---\n${selected.body ?? ""}`, inReplyTo: (selected as any).message_id ?? null })} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"><Reply className="h-3 w-3" /> Reply</button>
                <button onClick={() => openCompose({ to: selected.from_addr ?? "", cc: selected.cc ?? "", subject: `Re: ${selected.subject ?? ""}`, body: `\n\n---\n${selected.body ?? ""}`, inReplyTo: (selected as any).message_id ?? null })} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"><ReplyAll className="h-3 w-3" /> Reply all</button>
                <button onClick={() => openCompose({ subject: `Fwd: ${selected.subject ?? ""}`, body: `\n\n---\nFrom: ${selected.from_addr}\n${selected.body ?? ""}` })} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"><Forward className="h-3 w-3" /> Forward</button>
                <div className="ml-auto flex items-center gap-1">
                  <button onClick={() => setFlag(selected.id, selected.status === "flagged" ? "read" : "flagged")} className="rounded-md p-1.5 hover:bg-muted" title="Flag"><Star className={`h-3.5 w-3.5 ${selected.status === "flagged" ? "fill-amber-400 text-amber-500" : ""}`} /></button>
                  <button onClick={() => setFlag(selected.id, "archived")} className="rounded-md p-1.5 hover:bg-muted" title="Archive"><Archive className="h-3.5 w-3.5" /></button>
                  <button onClick={() => deleteEmail(selected.id)} className="rounded-md p-1.5 hover:bg-destructive/10 hover:text-destructive" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <h1 className="text-xl font-semibold">{selected.subject || "(no subject)"}</h1>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials(selected.from_addr)}</div>
                <div className="min-w-0 flex-1 text-[13px]">
                  <p><span className="font-semibold">{selected.from_addr || "—"}</span></p>
                  <p className="text-muted-foreground">to {selected.to_addr}{selected.cc ? `, cc: ${selected.cc}` : ""}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">{new Date(selected.created_at).toLocaleString()}</span>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-relaxed text-foreground">{selected.body || "(empty)"}</pre>
            </div>
          </>
        )}
      </section>

      {compose && (
        <div className="fixed inset-0 z-40 flex items-end justify-end bg-black/30 p-6" onClick={() => setCompose(null)}>
          <div className="flex h-[560px] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <header className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
              <p className="text-sm font-semibold">New message</p>
              <button onClick={() => setCompose(null)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </header>
            <div className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-1 border-b border-border px-4 py-3 text-[13px]">
              <span className="pt-1.5 text-muted-foreground">From</span>
              <select value={compose.mailbox} onChange={(e) => setCompose({ ...compose, mailbox: e.target.value })} className="rounded border border-border bg-background px-2 py-1 outline-none">
                <option value="personal">Personal</option>
                {SHARED_BOXES.map((m) => <option key={m} value={m}>{m}@</option>)}
              </select>
              <span className="pt-1.5 text-muted-foreground">To</span>
              <input value={compose.to} onChange={(e) => setCompose({ ...compose, to: e.target.value })} placeholder="recipient@example.com" className="rounded border border-border bg-background px-2 py-1 outline-none" />
              <span className="pt-1.5 text-muted-foreground">Cc</span>
              <input value={compose.cc} onChange={(e) => setCompose({ ...compose, cc: e.target.value })} className="rounded border border-border bg-background px-2 py-1 outline-none" />
              <span className="pt-1.5 text-muted-foreground">Subject</span>
              <input value={compose.subject} onChange={(e) => setCompose({ ...compose, subject: e.target.value })} className="rounded border border-border bg-background px-2 py-1 outline-none" />
            </div>
            <textarea value={compose.body} onChange={(e) => setCompose({ ...compose, body: e.target.value })} placeholder="Write your message…" className="flex-1 resize-none border-0 bg-background p-4 text-[14px] outline-none" />
            <footer className="flex items-center justify-between gap-2 border-t border-border p-3">
              <div className="flex items-center gap-2">
                {templates.length > 0 && (
                  <select onChange={(e) => { const t = templates.find((x) => x.id === e.target.value); if (t) setCompose({ ...compose, subject: t.subject ?? compose.subject, body: t.body ?? compose.body }); e.target.value = ""; }} className="rounded border border-border bg-background px-2 py-1.5 text-xs">
                    <option value="">Insert template…</option>
                    {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                )}
                <button className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground" disabled><Paperclip className="h-3 w-3" /> Attach</button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => sendCompose(true)} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted">Save draft</button>
                <button disabled={sending} onClick={() => sendCompose(false)} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"><Send className="h-3 w-3" /> {sending ? "Sending…" : "Send"}</button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

function ManageView({ view, rules, templates, onRefresh, onUseTemplate }: { view: "rules" | "templates"; rules: Rule[]; templates: Template[]; onRefresh: () => void; onUseTemplate: (t: Template) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [ruleForm, setRuleForm] = useState({ name: "", match_field: "from_addr", match_value: "", action: "label", action_value: "", active: true });
  const [tplForm, setTplForm] = useState({ name: "", category: "general", subject: "", body: "" });

  const saveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("hq_email_rules").insert({ ...ruleForm, created_by: u.user?.id } as any);
    if (error) return alert(error.message);
    setRuleForm({ name: "", match_field: "from_addr", match_value: "", action: "label", action_value: "", active: true });
    setShowForm(false);
    onRefresh();
  };
  const saveTpl = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("hq_email_templates").insert({ ...tplForm, created_by: u.user?.id } as any);
    if (error) return alert(error.message);
    setTplForm({ name: "", category: "general", subject: "", body: "" });
    setShowForm(false);
    onRefresh();
  };
  const remove = async (table: "hq_email_rules" | "hq_email_templates", id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from(table).delete().eq("id", id);
    onRefresh();
  };
  const toggleRule = async (r: Rule) => {
    await supabase.from("hq_email_rules").update({ active: !r.active }).eq("id", r.id);
    onRefresh();
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Manage</p>
          <h1 className="text-lg font-semibold">{view === "rules" ? "Email Rules" : "Templates"}</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="h-3.5 w-3.5" /> New {view === "rules" ? "rule" : "template"}</button>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {view === "rules" ? (
          rules.length === 0 ? <p className="text-sm text-muted-foreground">No rules yet.</p> : (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">When</th><th className="px-3 py-2 text-left">Action</th><th className="px-3 py-2 text-left">Value</th><th className="px-3 py-2"></th></tr>
                </thead>
                <tbody>
                  {rules.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{r.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{r.match_field} contains "{r.match_value}"</td>
                      <td className="px-3 py-2"><span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase">{r.action}</span></td>
                      <td className="px-3 py-2 text-muted-foreground">{r.action_value || "—"}</td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => toggleRule(r)} className={`mr-2 rounded px-2 py-1 text-[10px] font-semibold ${r.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>{r.active ? "Active" : "Off"}</button>
                        <button onClick={() => remove("hq_email_rules", r.id)} className="rounded p-1 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          templates.length === 0 ? <p className="text-sm text-muted-foreground">No templates yet.</p> : (
            <div className="grid grid-cols-2 gap-3">
              {templates.map((t) => (
                <div key={t.id} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{t.name}</p>
                      {t.category && <span className="mt-0.5 inline-block rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">{t.category}</span>}
                    </div>
                    <button onClick={() => remove("hq_email_templates", t.id)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <p className="mt-2 truncate text-sm text-muted-foreground">{t.subject}</p>
                  <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{t.body}</p>
                  <button onClick={() => onUseTemplate(t)} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Use template <ChevronRight className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-6" onClick={() => setShowForm(false)}>
          <form onSubmit={view === "rules" ? saveRule : saveTpl} className="w-full max-w-lg space-y-3 rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">New {view === "rules" ? "rule" : "template"}</h2>
            {view === "rules" ? (
              <>
                <input required placeholder="Rule name" value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} className="w-full rounded border border-border bg-background px-3 py-2 text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={ruleForm.match_field} onChange={(e) => setRuleForm({ ...ruleForm, match_field: e.target.value })} className="rounded border border-border bg-background px-2 py-2 text-sm">
                    <option value="from_addr">From</option><option value="to_addr">To</option><option value="subject">Subject</option><option value="body">Body</option>
                  </select>
                  <input required placeholder="contains…" value={ruleForm.match_value} onChange={(e) => setRuleForm({ ...ruleForm, match_value: e.target.value })} className="rounded border border-border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select value={ruleForm.action} onChange={(e) => setRuleForm({ ...ruleForm, action: e.target.value })} className="rounded border border-border bg-background px-2 py-2 text-sm">
                    <option value="label">Apply label</option><option value="forward">Forward</option><option value="move">Move</option><option value="reply">Auto-reply</option><option value="delete">Delete</option>
                  </select>
                  <input placeholder="value" value={ruleForm.action_value} onChange={(e) => setRuleForm({ ...ruleForm, action_value: e.target.value })} className="rounded border border-border bg-background px-3 py-2 text-sm" />
                </div>
              </>
            ) : (
              <>
                <input required placeholder="Template name" value={tplForm.name} onChange={(e) => setTplForm({ ...tplForm, name: e.target.value })} className="w-full rounded border border-border bg-background px-3 py-2 text-sm" />
                <select value={tplForm.category} onChange={(e) => setTplForm({ ...tplForm, category: e.target.value })} className="w-full rounded border border-border bg-background px-2 py-2 text-sm">
                  <option value="general">General</option><option value="sales">Sales</option><option value="support">Support</option><option value="onboarding">Onboarding</option><option value="marketing">Marketing</option>
                </select>
                <input placeholder="Subject" value={tplForm.subject} onChange={(e) => setTplForm({ ...tplForm, subject: e.target.value })} className="w-full rounded border border-border bg-background px-3 py-2 text-sm" />
                <textarea placeholder="Body" value={tplForm.body} onChange={(e) => setTplForm({ ...tplForm, body: e.target.value })} rows={6} className="w-full rounded border border-border bg-background px-3 py-2 text-sm" />
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-border px-3 py-1.5 text-sm">Cancel</button>
              <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
