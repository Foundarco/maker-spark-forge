import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, User, Palette, Bell, BookOpen, LifeBuoy, Send, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UserMention } from "@/components/hq/UserMention";

export const Route = createFileRoute("/_hq/help")({
  head: () => ({ meta: [{ title: "Help & Support — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: HelpPage,
});

type Doc = { id: string; title: string; body: string | null; category: string | null };

const QUICK = [
  { icon: KeyRound, title: "Reset your password", desc: "Sign out and use the ‘Forgot password’ flow on the login page.", to: "/hq-login" },
  { icon: User, title: "Update your profile", desc: "Change your name, avatar, and department.", to: "/profile" },
  { icon: Palette, title: "Change theme", desc: "Switch between light and dark mode.", to: "/settings" },
  { icon: Bell, title: "Notifications", desc: "See recent alerts and mark them read.", to: "/notifications" },
];

const STARTER_DOCS: Doc[] = [
  { id: "d1", title: "Getting started with Clovr HQ", body: "Tour the sidebar, record tabs, and quick add. Your workspace is organized by team — Product, Growth, Customer Service, HR & Administration.", category: "Basics" },
  { id: "d2", title: "How to reset your password", body: "Sign out from the sidebar footer. On the login page click ‘Forgot password’ and follow the emailed link. If email doesn't arrive, contact Operations below.", category: "Account" },
  { id: "d3", title: "Booking a meeting", body: "Open Meetings, click New meeting, invite attendees via @mention. Recurring meetings support daily, weekly, biweekly, monthly. Time is auto-logged for attendees.", category: "Software" },
  { id: "d4", title: "Requesting time off", body: "People → Time Off. Submit a request, your manager gets a notification. Approved days appear on the team calendar.", category: "HR" },
  { id: "d5", title: "Reporting an outage", body: "Use the Contact Operations form below. Set urgency to ‘Urgent’ for production/customer impact. Ops is paged for urgent tickets.", category: "IT" },
  { id: "d6", title: "Using the AI Assistant", body: "The Assistant page can draft emails, summarize threads, and search across HQ. It respects your role permissions.", category: "Software" },
];

function HelpPage() {
  const [query, setQuery] = useState("");
  const [opsUser, setOpsUser] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState({ subject: "", urgency: "normal", body: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("admin_settings").select("value").eq("key", "ops_support_user_id").maybeSingle();
      const uid = (data?.value as any)?.user_id;
      if (uid) {
        const { data: p } = await supabase.from("profiles").select("id, full_name, email").eq("id", uid).maybeSingle();
        if (p) setOpsUser({ id: p.id, name: p.full_name || p.email || "Operations" });
      }
    })();
  }, []);

  const filtered = STARTER_DOCS.filter((d) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return d.title.toLowerCase().includes(q) || (d.body ?? "").toLowerCase().includes(q) || (d.category ?? "").toLowerCase().includes(q);
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim()) return;
    setSending(true);
    const { data: u } = await supabase.auth.getUser();
    await supabase.from("cs_tickets").insert({
      subject: form.subject,
      description: form.body,
      priority: form.urgency === "urgent" ? "high" : form.urgency,
      channel: "internal",
      status: "open",
      assignee_id: opsUser?.id ?? null,
      created_by: u.user?.id ?? null,
    } as any);
    setSending(false);
    setSent(true);
    setForm({ subject: "", urgency: "normal", body: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Support</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Help & Support</h1>
        <p className="mt-1 text-sm text-muted-foreground">Self-serve docs and a direct line to Operations.</p>
      </div>

      {/* Quick self-serve */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Quick self-serve</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK.map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.title}
                to={q.to}
                className="group rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">{q.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{q.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Internal docs */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Internal docs</h2>
          <div className="flex w-64 items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search docs…"
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {filtered.map((d) => (
            <details key={d.id} className="group">
              <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-muted/40">
                <BookOpen className="h-4 w-4 flex-shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{d.title}</p>
                  {d.category && <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{d.category}</p>}
                </div>
              </summary>
              <div className="border-t border-border bg-muted/30 px-4 py-3 text-sm text-foreground/80">
                {d.body}
              </div>
            </details>
          ))}
          {filtered.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted-foreground">No docs match “{query}”.</p>}
        </div>
      </section>

      {/* Contact Operations */}
      <section>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <LifeBuoy className="h-4 w-4 text-primary" /> Contact Operations
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">Can't self-serve? Send a ticket to the operations team.</p>
            </div>
            {opsUser && (
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs">
                <span className="text-muted-foreground">On call:</span>
                <UserMention userId={opsUser.id} name={opsUser.name} />
              </div>
            )}
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Subject</label>
              <input aria-label="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Short summary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Urgency</label>
              <select aria-label="Urgency"
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="low">Low — general question</option>
                <option value="normal">Normal — needs attention this week</option>
                <option value="high">High — blocking work</option>
                <option value="urgent">Urgent — production / customer impact</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Details</label>
              <textarea aria-label="Details"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="What's happening? Include any error messages or steps to reproduce."
              />
            </div>
            <div className="flex items-center justify-between">
              {sent ? (
                <p className="text-xs text-success">Ticket sent — Operations will follow up.</p>
              ) : (
                <p className="text-xs text-muted-foreground">Your ticket is logged in Customer Service → Tickets.</p>
              )}
              <button
                type="submit"
                disabled={sending || !form.subject.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {sending ? "Sending…" : "Send to Operations"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
