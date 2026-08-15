import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Plus, Trash2, Coins, Percent, HardHat, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RecordLayout, ProfileCard, ActivityRail, type ActivityEvent } from "@/components/hq/RecordLayout";
import { ContextThread } from "@/components/hq/ContextThread";
import { UserMention } from "@/components/hq/UserMention";

type Row = Record<string, any>;

const TABS = ["Details", "Line Items", "Customer Note", "Associated", "Internal Notes"] as const;
type Tab = (typeof TABS)[number];

const STATUSES = ["draft", "sent", "approved", "won", "declined", "lost"];

function money(n: any) {
  return `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
}

function QuoteDetail() {
  const { id } = useParams({ from: "/_hq/quotes/$id" });
  const [quote, setQuote] = useState<Row | null>(null);
  const [lines, setLines] = useState<Row[]>([]);
  const [client, setClient] = useState<Row | null>(null);
  const [clients, setClients] = useState<Row[]>([]);
  const [profiles, setProfiles] = useState<Row[]>([]);
  const [job, setJob] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("Details");

  const load = async () => {
    const [e, l, c, p] = await Promise.all([
      (supabase.from("con_estimates") as any).select("*").eq("id", id).maybeSingle(),
      (supabase.from("con_estimate_lines") as any).select("*").eq("estimate_id", id).order("sort_order"),
      (supabase.from("con_clients") as any).select("id, name, company, email, phone, billing_address"),
      supabase.from("profiles").select("id, full_name, email"),
    ]);
    const row = e.data ?? null;
    setQuote(row);
    setLines((l.data ?? []) as Row[]);
    setClients((c.data ?? []) as Row[]);
    setProfiles((p.data ?? []) as Row[]);
    setClient((c.data ?? []).find((x: Row) => x.id === row?.client_id) ?? null);
    if (row?.job_id) {
      const { data: j } = await (supabase.from("con_jobs") as any).select("id, job_number, name, stage").eq("id", row.job_id).maybeSingle();
      setJob(j ?? null);
    } else setJob(null);
    setLoading(false);
  };

  useEffect(() => { setLoading(true); load(); /* eslint-disable-next-line */ }, [id]);

  const patch = async (values: Row) => {
    if (!quote) return;
    setQuote({ ...quote, ...values });
    setSaving(true);
    const { error } = await (supabase.from("con_estimates") as any).update(values).eq("id", quote.id);
    setSaving(false);
    if (error) { alert(error.message); }
    await load();
  };

  const addLine = async () => {
    const { error } = await (supabase.from("con_estimate_lines") as any).insert({
      estimate_id: id, description: "New line item", quantity: 1, unit: "ea", unit_price: 0, sort_order: lines.length,
    });
    if (error) { alert(error.message); return; }
    await load();
  };

  const patchLine = async (lineId: string, values: Row) => {
    setLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, ...values } : l)));
    const { error } = await (supabase.from("con_estimate_lines") as any).update(values).eq("id", lineId);
    if (error) alert(error.message);
    await load();
  };

  const removeLine = async (lineId: string) => {
    await (supabase.from("con_estimate_lines") as any).delete().eq("id", lineId);
    await load();
  };

  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + Number(l.quantity || 0) * Number(l.unit_price || 0), 0);
    const cost = lines.reduce((s, l) => s + Number(l.quantity || 0) * (Number(l.material_cost || 0) + Number(l.labor_cost || 0) + Number(l.equipment_cost || 0)), 0);
    const margin = subtotal - cost;
    return { subtotal, cost, margin, marginPct: subtotal > 0 ? Math.round((margin / subtotal) * 100) : 0 };
  }, [lines]);

  const activity: ActivityEvent[] = useMemo(() => {
    if (!quote) return [];
    const ev: ActivityEvent[] = [
      { id: "created", icon: FileText, title: "Quote created", meta: quote.estimate_number ?? "", timestamp: fmt(quote.created_at), tone: "default" },
    ];
    if (quote.sent_at) ev.push({ id: "sent", icon: FileText, title: "Sent to customer", meta: quote.contact_email ?? "", timestamp: fmt(quote.sent_at), tone: "primary" });
    if (quote.approved_at) ev.push({ id: "won", icon: HardHat, title: "Quote won", meta: job ? `Job ${job.job_number}` : "Job created", timestamp: fmt(quote.approved_at), tone: "success" });
    return ev;
  }, [quote, job]);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!quote) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-muted-foreground">Quote not found.</p>
        <Link to="/quotes" className="mt-3 inline-block text-sm text-primary hover:underline">Back to quotes</Link>
      </div>
    );
  }

  const owner = profiles.find((p) => p.id === quote.estimator_id);

  return (
    <RecordLayout
      scope="quote"
      header={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/quotes" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Back to quotes"><ArrowLeft className="h-4 w-4" /></Link>
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-muted-foreground">{quote.estimate_number ?? "—"}</p>
              <h1 className="truncate text-base font-semibold leading-tight">{quote.title}</h1>
            </div>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={quote.status}
              onChange={(e) => patch({ status: e.target.value, ...(e.target.value === "sent" && !quote.sent_at ? { sent_at: new Date().toISOString() } : {}) })}
              aria-label="Quote status"
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs capitalize"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <nav className="flex flex-wrap gap-1">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{t}</button>
              ))}
            </nav>
          </div>
        </div>
      }
      profile={
        <ProfileCard
          name={client ? client.company || client.name : "No customer linked"}
          subtitle={quote.contact_name || client?.email || "Assign a customer to this quote"}
          tags={[
            { label: quote.status, tone: ["won", "approved"].includes(quote.status) ? "success" : "primary" },
            { label: `${totals.marginPct}% margin`, tone: "muted" },
          ]}
          email={quote.contact_email || client?.email}
          phone={client?.phone}
          fields={[
            { label: "Customer", value: client ? <Link to="/clients/$id" params={{ id: client.id }} className="text-primary hover:underline">{client.company || client.name}</Link> : "—" },
            { label: "Owner", value: owner ? <UserMention userId={owner.id} name={owner.full_name || owner.email || "User"} /> : "—" },
            { label: "Quoted", value: fmt(quote.quoted_date) },
            { label: "Valid until", value: fmt(quote.valid_until) },
            { label: "Subtotal", value: money(quote.subtotal) },
            { label: "Total", value: money(quote.total) },
            { label: "Cost", value: money(quote.cost_total) },
            { label: "Margin", value: <span className={totals.margin < 0 ? "text-destructive" : "text-emerald-600"}>{money(totals.margin)}</span> },
            { label: "Job", value: job ? <Link to="/jobs/$id" params={{ id: job.id }} className="text-primary hover:underline">{job.job_number} · {job.name}</Link> : "Not converted" },
          ]}
        />
      }
      activity={<ActivityRail title="Quote activity" events={activity} />}
    >
      {tab === "Internal Notes" ? (
        <div className="h-full"><ContextThread entityType="estimate" entityId={quote.id} title={`Internal notes · ${quote.estimate_number ?? quote.title}`} /></div>
      ) : (
        <div className="space-y-5 p-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi icon={Coins} label="Subtotal" value={money(totals.subtotal)} />
            <Kpi icon={Coins} label="Total" value={money(quote.total)} />
            <Kpi icon={Coins} label="Est. cost" value={money(totals.cost)} />
            <Kpi icon={Percent} label="Margin" value={`${totals.marginPct}%`} />
          </div>

          {tab === "Details" && (
            <>
              <Panel title="Quote details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Title"><input className={inputCls} value={quote.title ?? ""} onChange={(e) => setQuote({ ...quote, title: e.target.value })} onBlur={(e) => patch({ title: e.target.value })} /></Field>
                  <Field label="Quote number"><input className={inputCls} value={quote.estimate_number ?? ""} onChange={(e) => setQuote({ ...quote, estimate_number: e.target.value })} onBlur={(e) => patch({ estimate_number: e.target.value })} /></Field>
                  <Field label="Customer">
                    <select className={inputCls} value={quote.client_id ?? ""} onChange={(e) => patch({ client_id: e.target.value || null })}>
                      <option value="">— none —</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.company || c.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Owner">
                    <select className={inputCls} value={quote.estimator_id ?? ""} onChange={(e) => patch({ estimator_id: e.target.value || null })}>
                      <option value="">— unassigned —</option>
                      {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                    </select>
                  </Field>
                  <Field label="Contact name"><input className={inputCls} value={quote.contact_name ?? ""} onChange={(e) => setQuote({ ...quote, contact_name: e.target.value })} onBlur={(e) => patch({ contact_name: e.target.value })} /></Field>
                  <Field label="Contact email"><input className={inputCls} value={quote.contact_email ?? ""} onChange={(e) => setQuote({ ...quote, contact_email: e.target.value })} onBlur={(e) => patch({ contact_email: e.target.value })} /></Field>
                  <Field label="Priority">
                    <select className={inputCls} value={quote.priority ?? "moderate"} onChange={(e) => patch({ priority: e.target.value })}>
                      {["low", "moderate", "high", "urgent"].map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </Field>
                  <Field label="Valid until"><input type="date" className={inputCls} value={quote.valid_until ?? ""} onChange={(e) => patch({ valid_until: e.target.value || null })} /></Field>
                  <Field label="Payment terms"><input className={inputCls} placeholder="Net 30" value={quote.payment_terms ?? ""} onChange={(e) => setQuote({ ...quote, payment_terms: e.target.value })} onBlur={(e) => patch({ payment_terms: e.target.value })} /></Field>
                  <Field label="Discount %"><input type="number" className={inputCls} value={quote.discount_pct ?? 0} onChange={(e) => setQuote({ ...quote, discount_pct: e.target.value })} onBlur={(e) => patch({ discount_pct: Number(e.target.value || 0) })} /></Field>
                  <Field label="Taxable">
                    <select className={inputCls} value={quote.taxable ? "yes" : "no"} onChange={(e) => patch({ taxable: e.target.value === "yes" })}>
                      <option value="no">No</option><option value="yes">Yes</option>
                    </select>
                  </Field>
                  <Field label="Tax rate %"><input type="number" className={inputCls} value={quote.tax_rate ?? 0} onChange={(e) => setQuote({ ...quote, tax_rate: e.target.value })} onBlur={(e) => patch({ tax_rate: Number(e.target.value || 0) })} /></Field>
                  <Field label="Billing address" full><textarea rows={2} className={inputCls} value={quote.billing_address ?? ""} onChange={(e) => setQuote({ ...quote, billing_address: e.target.value })} onBlur={(e) => patch({ billing_address: e.target.value })} /></Field>
                  <Field label="Scope of work" full><textarea rows={4} className={inputCls} value={quote.scope ?? ""} onChange={(e) => setQuote({ ...quote, scope: e.target.value })} onBlur={(e) => patch({ scope: e.target.value })} /></Field>
                </div>
              </Panel>
              <p className="text-xs text-muted-foreground">
                Set the status to <strong>Won</strong> and the quote converts itself into an active program with a kickoff task.
              </p>
            </>
          )}

          {tab === "Line Items" && (
            <Panel title={`Line items (${lines.length})`} action={<button onClick={addLine} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted"><Plus className="h-3.5 w-3.5" />Add line</button>}>
              {lines.length === 0 ? (
                <p className="text-xs text-muted-foreground">No line items yet. Add the first one to build the quote.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                        <th className="py-2 pr-2 font-medium">Description</th>
                        <th className="py-2 px-2 font-medium">Category</th>
                        <th className="py-2 px-2 text-right font-medium">Qty</th>
                        <th className="py-2 px-2 font-medium">Unit</th>
                        <th className="py-2 px-2 text-right font-medium">Price</th>
                        <th className="py-2 px-2 text-right font-medium">Mat.</th>
                        <th className="py-2 px-2 text-right font-medium">Labor</th>
                        <th className="py-2 px-2 text-right font-medium">Equip.</th>
                        <th className="py-2 px-2 text-right font-medium">Total</th>
                        <th className="py-2 pl-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {lines.map((l) => (
                        <tr key={l.id}>
                          <td className="py-1.5 pr-2"><input aria-label="Description" className={cellCls} value={l.description ?? ""} onChange={(e) => setLines((p) => p.map((x) => x.id === l.id ? { ...x, description: e.target.value } : x))} onBlur={(e) => patchLine(l.id, { description: e.target.value })} /></td>
                          <td className="px-2"><input aria-label="Category" className={cellCls} value={l.category ?? ""} onChange={(e) => setLines((p) => p.map((x) => x.id === l.id ? { ...x, category: e.target.value } : x))} onBlur={(e) => patchLine(l.id, { category: e.target.value })} /></td>
                          <td className="px-2"><input aria-label="Quantity" type="number" className={`${cellCls} text-right`} value={l.quantity ?? 0} onChange={(e) => setLines((p) => p.map((x) => x.id === l.id ? { ...x, quantity: e.target.value } : x))} onBlur={(e) => patchLine(l.id, { quantity: Number(e.target.value || 0) })} /></td>
                          <td className="px-2"><input aria-label="Unit" className={`${cellCls} w-16`} value={l.unit ?? ""} onChange={(e) => setLines((p) => p.map((x) => x.id === l.id ? { ...x, unit: e.target.value } : x))} onBlur={(e) => patchLine(l.id, { unit: e.target.value })} /></td>
                          <td className="px-2"><input aria-label="Unit price" type="number" className={`${cellCls} text-right`} value={l.unit_price ?? 0} onChange={(e) => setLines((p) => p.map((x) => x.id === l.id ? { ...x, unit_price: e.target.value } : x))} onBlur={(e) => patchLine(l.id, { unit_price: Number(e.target.value || 0) })} /></td>
                          <td className="px-2"><input aria-label="Material cost" type="number" className={`${cellCls} text-right`} value={l.material_cost ?? 0} onChange={(e) => setLines((p) => p.map((x) => x.id === l.id ? { ...x, material_cost: e.target.value } : x))} onBlur={(e) => patchLine(l.id, { material_cost: Number(e.target.value || 0) })} /></td>
                          <td className="px-2"><input aria-label="Labor cost" type="number" className={`${cellCls} text-right`} value={l.labor_cost ?? 0} onChange={(e) => setLines((p) => p.map((x) => x.id === l.id ? { ...x, labor_cost: e.target.value } : x))} onBlur={(e) => patchLine(l.id, { labor_cost: Number(e.target.value || 0) })} /></td>
                          <td className="px-2"><input aria-label="Equipment cost" type="number" className={`${cellCls} text-right`} value={l.equipment_cost ?? 0} onChange={(e) => setLines((p) => p.map((x) => x.id === l.id ? { ...x, equipment_cost: e.target.value } : x))} onBlur={(e) => patchLine(l.id, { equipment_cost: Number(e.target.value || 0) })} /></td>
                          <td className="px-2 text-right font-mono text-xs">{money(Number(l.quantity || 0) * Number(l.unit_price || 0))}</td>
                          <td className="pl-2 text-right">
                            <button onClick={() => removeLine(l.id)} aria-label="Remove line" className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border text-sm">
                        <td colSpan={8} className="py-2 pr-2 text-right text-xs uppercase tracking-wider text-muted-foreground">Subtotal</td>
                        <td className="px-2 py-2 text-right font-mono font-semibold">{money(totals.subtotal)}</td>
                        <td />
                      </tr>
                      <tr className="text-sm">
                        <td colSpan={8} className="py-1 pr-2 text-right text-xs uppercase tracking-wider text-muted-foreground">Quote total</td>
                        <td className="px-2 py-1 text-right font-mono font-semibold">{money(quote.total)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </Panel>
          )}

          {tab === "Customer Note" && (
            <Panel title="Note to customer">
              <textarea
                rows={10}
                aria-label="Note to customer"
                className={inputCls}
                value={quote.note_to_customer ?? ""}
                onChange={(e) => setQuote({ ...quote, note_to_customer: e.target.value })}
                onBlur={(e) => patch({ note_to_customer: e.target.value })}
                placeholder="Terms, exclusions, schedule assumptions the customer should see on the proposal…"
              />
            </Panel>
          )}

          {tab === "Associated" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Job">
                {job ? (
                  <Link to="/jobs/$id" params={{ id: job.id }} className="text-sm text-primary hover:underline">{job.job_number} · {job.name} <span className="text-muted-foreground">({job.stage})</span></Link>
                ) : <p className="text-xs text-muted-foreground">No job yet — mark this quote Won to create one.</p>}
              </Panel>
              <Panel title="Customer">
                {client ? (
                  <Link to="/clients/$id" params={{ id: client.id }} className="text-sm text-primary hover:underline">{client.company || client.name}</Link>
                ) : <p className="text-xs text-muted-foreground">No customer linked.</p>}
              </Panel>
            </div>
          )}
        </div>
      )}
    </RecordLayout>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary";
const cellCls = "w-full rounded border border-transparent bg-transparent px-1.5 py-1 text-sm outline-none hover:border-border focus:border-primary";

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export const Route = createFileRoute("/_hq/quotes/$id")({
  head: () => ({ meta: [{ title: "Quote — Clovr Labs HQ" }, { name: "robots", content: "noindex" }] }),
  component: QuoteDetail,
});
