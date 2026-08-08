import { createFileRoute } from "@tanstack/react-router";
import { EscapeKey } from "@/components/hq/EscapeKey";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { IdCard, Users, UserCheck, Mail, Trash2, Ban, Plus, Building2, ClipboardCheck, Search, X, Check } from "lucide-react";
import { UserMention } from "@/components/hq/UserMention";
import { sendInvite as sendInviteFn } from "@/lib/hq/invite.functions";

export const Route = createFileRoute("/_hq/employees")({
  head: () => ({ meta: [{ title: "People — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: PeoplePage,
});

const SYS_ROLES = ["employee","manager","hr","engineering","manufacturing","sales","finance","marketing","support","it","admin","super_admin"];
const DEPARTMENTS = ["Engineering","Manufacturing","Sales","Marketing","Finance","HR","IT","Support","Operations","Executive"];

type Profile = { id: string; email: string | null; full_name: string | null; department: string | null; title: string | null };
type Employee = { id: string; user_id: string | null; full_name: string; email: string | null; department: string | null; title: string | null; status: string; start_date: string | null; manager_id: string | null; employment_type: string | null };
type Invite = { id: string; email: string; role: string; department: string | null; full_name: string | null; expires_at: string; accepted_at: string | null; created_at: string };
type Suspension = { id: string; user_id: string; reason: string | null; starts_at: string; ends_at: string | null; active: boolean; created_at: string };
type CustomRole = { id: string; name: string; color: string };
type SysRoleRow = { user_id: string; role: string };
type CustomRoleAssign = { user_id: string; role_id: string };

function PeoplePage() {
  const [tab, setTab] = useState<"directory"|"invites"|"suspensions"|"onboarding">("directory");
  const [me, setMe] = useState<{ id: string; isAdmin: boolean } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const { data: rs } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      const roles = (rs ?? []).map((r: any) => r.role);
      setMe({ id: data.user.id, isAdmin: roles.includes("super_admin") || roles.includes("admin") });
    })();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><IdCard className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">HR & Administration</p>
          <h1 className="text-3xl font-semibold tracking-tight">People</h1>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {([
          ["directory","Directory",Users],
          ["invites","Invites & Roles",Mail],
          ["suspensions","Suspensions",Ban],
          ["onboarding","Onboarding",ClipboardCheck],
        ] as const).map(([k,label,Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${tab===k?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab==="directory" && <Directory me={me} />}
      {tab==="invites" && <InvitesRoles me={me} />}
      {tab==="suspensions" && <Suspensions me={me} />}
      {tab==="onboarding" && <OnboardingTab />}
    </div>
  );
}

function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const reload = async () => {
    const { data } = await supabase.from("profiles").select("id, email, full_name, department, title").order("full_name");
    setProfiles((data ?? []) as Profile[]);
  };
  useEffect(() => { reload(); }, []);
  return { profiles, reload };
}

function Directory({ me }: { me: { id: string; isAdmin: boolean } | null }) {
  const { profiles, reload: reloadProfiles } = useProfiles();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Employee | null>(null);

  const reload = async () => {
    const { data } = await supabase.from("hr_employees").select("*").order("full_name");
    setEmployees((data ?? []) as Employee[]);
  };
  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    if (!s) return employees;
    return employees.filter((e) => [e.full_name, e.email, e.title, e.department].some((v) => (v ?? "").toLowerCase().includes(s)));
  }, [employees, q]);

  const active = employees.filter((e) => e.status === "active").length;
  const depts = new Set(employees.map((e) => e.department).filter(Boolean)).size;

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi icon={Users} label="Total" value={employees.length} />
        <Kpi icon={UserCheck} label="Active" value={active} />
        <Kpi icon={Building2} label="Departments" value={depts} />
        <Kpi icon={Users} label="Full-time" value={employees.filter((e) => e.employment_type === "full_time").length} />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people…" className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm" />
        </div>
        <button onClick={() => setEditing({ id: "", user_id: null, full_name: "", email: "", department: "", title: "", status: "active", start_date: null, manager_id: null, employment_type: "full_time" })}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Add person
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Dept</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Manager</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t border-border hover:bg-muted/20">
                <td className="px-4 py-2 font-medium">
                  {e.user_id ? <UserMention userId={e.user_id} name={e.full_name} /> : e.full_name}
                </td>
                <td className="px-4 py-2">{e.title ?? "—"}</td>
                <td className="px-4 py-2">{e.department ?? "—"}</td>
                <td className="px-4 py-2"><StatusPill value={e.status} /></td>
                <td className="px-4 py-2">{e.manager_id ? <UserMention userId={e.manager_id} name={profiles.find((p) => p.id === e.manager_id)?.full_name ?? "—"} /> : <span className="text-muted-foreground">—</span>}</td>
                <td className="px-4 py-2 text-right"><button onClick={() => setEditing(e)} className="text-xs text-primary hover:underline">Edit</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No people yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && <EmployeeEditor employee={editing} profiles={profiles} onClose={() => setEditing(null)} onSaved={() => { reload(); reloadProfiles(); setEditing(null); }} />}
    </div>
  );
}

function EmployeeEditor({ employee, profiles, onClose, onSaved }: { employee: Employee; profiles: Profile[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Employee>(employee);
  const [saving, setSaving] = useState(false);
  const update = (patch: Partial<Employee>) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    setSaving(true);
    const payload: any = {
      full_name: form.full_name, email: form.email || null, department: form.department || null,
      title: form.title || null, status: form.status, start_date: form.start_date || null,
      manager_id: form.manager_id || null, employment_type: form.employment_type || null, user_id: form.user_id || null,
    };
    if (form.id) {
      await supabase.from("hr_employees").update(payload).eq("id", form.id);
      // Sync profile too if linked
      if (form.user_id) {
        await supabase.from("profiles").update({ full_name: form.full_name, department: form.department, title: form.title }).eq("id", form.user_id);
      }
    } else {
      await supabase.from("hr_employees").insert(payload);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Employee details">
      <EscapeKey onEscape={onClose} />
      <div role="dialog" aria-modal="true" className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{form.id ? "Edit person" : "Add person"}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name"><input aria-label="Full name" value={form.full_name} onChange={(e) => update({ full_name: e.target.value })} className={inputCls} /></Field>
          <Field label="Email"><input aria-label="Email" value={form.email ?? ""} onChange={(e) => update({ email: e.target.value })} className={inputCls} /></Field>
          <Field label="Title"><input aria-label="Title" value={form.title ?? ""} onChange={(e) => update({ title: e.target.value })} className={inputCls} /></Field>
          <Field label="Department">
            <select aria-label="Department" value={form.department ?? ""} onChange={(e) => update({ department: e.target.value })} className={inputCls}>
              <option value="">—</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select aria-label="Status" value={form.status} onChange={(e) => update({ status: e.target.value })} className={inputCls}>
              {["active","on_leave","terminated"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Employment type">
            <select aria-label="Employment type" value={form.employment_type ?? ""} onChange={(e) => update({ employment_type: e.target.value })} className={inputCls}>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>
          </Field>
          <Field label="Start date"><input aria-label="Start date" type="date" value={form.start_date ?? ""} onChange={(e) => update({ start_date: e.target.value })} className={inputCls} /></Field>
          <Field label="Manager">
            <select aria-label="Manager" value={form.manager_id ?? ""} onChange={(e) => update({ manager_id: e.target.value || null })} className={inputCls}>
              <option value="">—</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
            </select>
          </Field>
          <Field label="Linked HQ user (optional)" full>
            <select aria-label="Linked HQ user (optional)" value={form.user_id ?? ""} onChange={(e) => update({ user_id: e.target.value || null })} className={inputCls}>
              <option value="">Not linked</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

function InvitesRoles({ me }: { me: { id: string; isAdmin: boolean } | null }) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [sysRoles, setSysRoles] = useState<SysRoleRow[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [customAssign, setCustomAssign] = useState<CustomRoleAssign[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inv, setInv] = useState({ email: "", role: "employee", department: "", full_name: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<string | null>(null);

  const reload = async () => {
    const [i, p, r, cr, ca] = await Promise.all([
      supabase.from("invites").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, email, full_name, department, title").order("full_name"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("custom_roles").select("id, name, color").order("position", { ascending: false }),
      supabase.from("user_custom_roles").select("user_id, role_id"),
    ]);
    setInvites((i.data ?? []) as Invite[]);
    setProfiles((p.data ?? []) as Profile[]);
    setSysRoles((r.data ?? []) as SysRoleRow[]);
    setCustomRoles((cr.data ?? []) as CustomRole[]);
    setCustomAssign((ca.data ?? []) as CustomRoleAssign[]);
  };
  useEffect(() => { reload(); }, []);

  const invite = useServerFn(sendInviteFn);
  const [sending, setSending] = useState(false);
  const sendInvite = async () => {
    if (!inv.email.trim()) return;
    setMsg(null);
    setSending(true);
    try {
      const res: any = await invite({
        data: {
          email: inv.email.trim().toLowerCase(),
          role: inv.role,
          department: inv.department || null,
          full_name: inv.full_name || null,
        },
      });
      if (res?.warning) setMsg(`Invite saved. Email: ${res.warning}`);
      setInv({ email: "", role: "employee", department: "", full_name: "" });
      setShowInvite(false);
      reload();
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to send invite");
    } finally {
      setSending(false);
    }
  };

  const revoke = async (id: string) => { await supabase.from("invites").delete().eq("id", id); reload(); };

  const rolesOf = (uid: string) => sysRoles.filter((r) => r.user_id === uid).map((r) => r.role);
  const customsOf = (uid: string) => customAssign.filter((c) => c.user_id === uid).map((c) => customRoles.find((r) => r.id === c.role_id)).filter(Boolean) as CustomRole[];

  const toggleRole = async (uid: string, role: string) => {
    const has = rolesOf(uid).includes(role);
    if (has) await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", role as any);
    else await supabase.from("user_roles").insert({ user_id: uid, role: role as any });
    reload();
  };
  const toggleCustom = async (uid: string, role_id: string) => {
    const has = customAssign.some((c) => c.user_id === uid && c.role_id === role_id);
    if (has) await supabase.from("user_custom_roles").delete().eq("user_id", uid).eq("role_id", role_id);
    else await supabase.from("user_custom_roles").insert({ user_id: uid, role_id });
    reload();
  };

  const pending = invites.filter((i) => !i.accepted_at);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Team access</h2>
          <p className="text-sm text-muted-foreground">Invite new members, and manage each person's system + custom roles.</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Mail className="h-4 w-4" /> Invite user
        </button>
      </div>

      {pending.length > 0 && (
        <section className="mb-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending invites</h3>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-2 text-left">Email</th><th className="px-4 py-2 text-left">Role</th><th className="px-4 py-2 text-left">Dept</th><th className="px-4 py-2 text-left">Expires</th><th className="px-4 py-2"></th></tr>
              </thead>
              <tbody>
                {pending.map((i) => (
                  <tr key={i.id} className="border-t border-border">
                    <td className="px-4 py-2">{i.email}</td>
                    <td className="px-4 py-2"><span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{i.role}</span></td>
                    <td className="px-4 py-2">{i.department ?? "—"}</td>
                    <td className="px-4 py-2 text-muted-foreground">{new Date(i.expires_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right"><button onClick={() => revoke(i.id)} className="text-xs text-destructive hover:underline"><Trash2 className="inline h-3 w-3" /> Revoke</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active users ({profiles.length})</h3>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-2 text-left">Name</th><th className="px-4 py-2 text-left">Dept</th><th className="px-4 py-2 text-left">System roles</th><th className="px-4 py-2 text-left">Custom roles</th><th className="px-4 py-2"></th></tr>
            </thead>
            <tbody>
              {profiles.map((u) => (
                <tr key={u.id} className="border-t border-border align-top">
                  <td className="px-4 py-3"><UserMention userId={u.id} name={u.full_name ?? u.email ?? "—"} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{u.department ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {rolesOf(u.id).map((r) => <span key={r} className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{r}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {customsOf(u.id).map((r) => <span key={r.id} className="rounded px-2 py-0.5 text-xs" style={{ backgroundColor: `${r.color}20`, color: r.color }}>{r.name}</span>)}
                      {customsOf(u.id).length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditUser(u.id)} className="text-xs text-primary hover:underline">Edit roles</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowInvite(false)} role="dialog" aria-modal="true" aria-label="Invite user">
          <EscapeKey onEscape={() => setShowInvite(false)} />
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Invite a new user</h3>
              <button onClick={() => setShowInvite(false)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-2">
              <input aria-label="email@company.com" placeholder="email@company.com" value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} className={inputCls} />
              <input aria-label="Full name (optional)" placeholder="Full name (optional)" value={inv.full_name} onChange={(e) => setInv({ ...inv, full_name: e.target.value })} className={inputCls} />
              <select value={inv.department} onChange={(e) => setInv({ ...inv, department: e.target.value })} className={inputCls}>
                <option value="">Department…</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={inv.role} onChange={(e) => setInv({ ...inv, role: e.target.value })} className={inputCls}>
                {SYS_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {msg && <p className="mt-2 text-xs text-destructive">{msg}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowInvite(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
              <button onClick={sendInvite} disabled={sending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{sending ? "Sending…" : "Send invite & email"}</button>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditUser(null)} role="dialog" aria-modal="true" aria-label="Edit user">
          <EscapeKey onEscape={() => setEditUser(null)} />
          <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Edit roles</h3>
              <button onClick={() => setEditUser(null)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">System roles</p>
              <div className="flex flex-wrap gap-2">
                {SYS_ROLES.map((r) => {
                  const has = rolesOf(editUser).includes(r);
                  return <button key={r} onClick={() => toggleRole(editUser, r)} className={`rounded-full border px-3 py-1 text-xs ${has ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{has && <Check className="mr-1 inline h-3 w-3" />}{r}</button>;
                })}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Custom roles</p>
              <div className="flex flex-wrap gap-2">
                {customRoles.length === 0 ? <p className="text-xs text-muted-foreground">Create custom roles in Admin → Roles.</p> : customRoles.map((r) => {
                  const has = customAssign.some((c) => c.user_id === editUser && c.role_id === r.id);
                  return <button key={r.id} onClick={() => toggleCustom(editUser, r.id)} className={`rounded-full border px-3 py-1 text-xs ${has ? "" : "text-muted-foreground"}`} style={has ? { borderColor: r.color, backgroundColor: `${r.color}20`, color: r.color } : {}}>{has && <Check className="mr-1 inline h-3 w-3" />}{r.name}</button>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Suspensions({ me }: { me: { id: string; isAdmin: boolean } | null }) {
  const [rows, setRows] = useState<Suspension[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [form, setForm] = useState({ user_id: "", reason: "", ends_at: "" });
  const [msg, setMsg] = useState<string | null>(null);

  const reload = async () => {
    const [s, p] = await Promise.all([
      supabase.from("hr_suspensions").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, email, full_name, department, title"),
    ]);
    setRows((s.data ?? []) as Suspension[]);
    setProfiles((p.data ?? []) as Profile[]);
  };
  useEffect(() => { reload(); }, []);

  const suspend = async () => {
    if (!form.user_id) { setMsg("Select a user"); return; }
    setMsg(null);
    await supabase.from("hr_suspensions").insert({
      user_id: form.user_id, reason: form.reason || null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      created_by: me?.id, active: true,
    });
    setForm({ user_id: "", reason: "", ends_at: "" });
    reload();
  };
  const lift = async (id: string) => { await supabase.from("hr_suspensions").update({ active: false, ends_at: new Date().toISOString() }).eq("id", id); reload(); };

  const active = rows.filter((r) => r.active && (!r.ends_at || new Date(r.ends_at) > new Date()));
  const history = rows.filter((r) => !active.includes(r));

  return (
    <div>
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Suspend a user</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className={inputCls}>
            <option value="">Select person…</option>
            {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
          </select>
          <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} placeholder="End date (optional)" className={inputCls} />
          <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason" className={inputCls} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button onClick={suspend} className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">
            <Ban className="h-4 w-4" /> Suspend
          </button>
          {msg && <span className="text-xs text-destructive">{msg}</span>}
          <p className="ml-auto text-xs text-muted-foreground">Leave end date blank for indefinite.</p>
        </div>
      </div>

      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active suspensions ({active.length})</h3>
      <SuspensionTable rows={active} profiles={profiles} onLift={lift} />

      {history.length > 0 && <>
        <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">History</h3>
        <SuspensionTable rows={history} profiles={profiles} />
      </>}
    </div>
  );
}

function SuspensionTable({ rows, profiles, onLift }: { rows: Suspension[]; profiles: Profile[]; onLift?: (id: string) => void }) {
  if (rows.length === 0) return <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">None.</p>;
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="px-4 py-2 text-left">User</th><th className="px-4 py-2 text-left">Started</th><th className="px-4 py-2 text-left">Ends</th><th className="px-4 py-2 text-left">Reason</th><th className="px-4 py-2"></th></tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const p = profiles.find((pp) => pp.id === r.user_id);
            return (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-2"><UserMention userId={r.user_id} name={p?.full_name ?? p?.email ?? r.user_id} /></td>
                <td className="px-4 py-2 text-muted-foreground">{new Date(r.starts_at).toLocaleString()}</td>
                <td className="px-4 py-2 text-muted-foreground">{r.ends_at ? new Date(r.ends_at).toLocaleString() : "indefinite"}</td>
                <td className="px-4 py-2">{r.reason ?? "—"}</td>
                <td className="px-4 py-2 text-right">{onLift && <button onClick={() => onLift(r.id)} className="text-xs text-primary hover:underline">Lift</button>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OnboardingTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const reload = async () => {
    const [o, e] = await Promise.all([
      supabase.from("hr_onboarding").select("*").order("due_date", { ascending: true }),
      supabase.from("hr_employees").select("id, full_name, department, user_id"),
    ]);
    setRows(o.data ?? []);
    setEmployees((e.data ?? []) as Employee[]);
  };
  useEffect(() => { reload(); }, []);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("hr_onboarding").update({ status }).eq("id", id);
    reload();
  };

  const grouped = useMemo(() => {
    const m = new Map<string, any[]>();
    for (const r of rows) {
      const key = r.employee_id ?? "unassigned";
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(r);
    }
    return m;
  }, [rows]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <p className="text-sm text-muted-foreground">Tasks are auto-created from department templates when a user accepts their invite. Manage templates in <a className="text-primary hover:underline" href="/admin/company?tab=onboarding">Admin → Onboarding</a>.</p>
      </div>
      {employees.length === 0 && <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No employees.</p>}
      <div className="space-y-4">
        {employees.map((emp) => {
          const tasks = grouped.get(emp.id) ?? [];
          if (tasks.length === 0) return null;
          const done = tasks.filter((t) => t.status === "done").length;
          return (
            <div key={emp.id} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{emp.user_id ? <UserMention userId={emp.user_id} name={emp.full_name} /> : emp.full_name}</p>
                  <p className="text-xs text-muted-foreground">{emp.department ?? "—"} · {done}/{tasks.length} complete</p>
                </div>
                <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${(done/tasks.length)*100}%` }} />
                </div>
              </div>
              <ul className="space-y-1">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/30">
                    <input type="checkbox" checked={t.status === "done"} onChange={(e) => setStatus(t.id, e.target.checked ? "done" : "pending")} />
                    <span className={`flex-1 text-sm ${t.status === "done" ? "text-muted-foreground line-through" : ""}`}>{t.task}</span>
                    {t.category && <span className="rounded bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">{t.category}</span>}
                    {t.due_date && <span className="text-xs text-muted-foreground">{new Date(t.due_date).toLocaleDateString()}</span>}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const palette: Record<string,string> = {
    active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    on_leave: "border-amber-500/20 bg-amber-500/10 text-amber-600",
    terminated: "border-destructive/20 bg-destructive/10 text-destructive",
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${palette[value] ?? "border-border bg-muted/40 text-muted-foreground"}`}>{value}</span>;
}
