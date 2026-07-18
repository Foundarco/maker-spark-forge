import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building, Settings as SettingsIcon, Shield, ClipboardCheck, Plus, Trash2, ArrowUp, ArrowDown, Users, X, Check, Save, Mail, KeyRound, Layers } from "lucide-react";
import { navGroups } from "@/components/hq/nav-config";

export const Route = createFileRoute("/_hq/admin/company")({
  head: () => ({ meta: [{ title: "Company Settings — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/hq-login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    const rs = (roles ?? []).map((r: any) => r.role);
    if (!(rs.includes("super_admin") || rs.includes("admin"))) throw redirect({ to: "/dashboard" });
  },
  component: CompanyPage,
});

type Tab = "general" | "roles" | "access" | "overrides" | "onboarding" | "email";

const TAB_LIST: Array<[Tab, string, any]> = [
  ["general", "General", SettingsIcon],
  ["roles", "Roles", Shield],
  ["access", "Tab Access", Layers],
  ["overrides", "Overrides", KeyRound],
  ["onboarding", "Onboarding", ClipboardCheck],
  ["email", "Email", Mail],
];

function CompanyPage() {
  const initial = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("tab") as Tab | null) : null;
  const [tab, setTab] = useState<Tab>(initial && TAB_LIST.some(([k]) => k === initial) ? initial : "general");
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Building className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Administration</p>
          <h1 className="text-3xl font-semibold tracking-tight">Company Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Company profile, roles, tab access, overrides, onboarding, and email — all in one place.</p>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {TAB_LIST.map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
      {tab === "general" && <GeneralSettings />}
      {tab === "roles" && <RolesManager />}
      {tab === "access" && <RouteAccessMatrix />}
      {tab === "overrides" && <PermissionOverrides />}
      {tab === "onboarding" && <OnboardingTemplates />}
      {tab === "email" && <EmailSettings />}
    </div>
  );
}

/* ─────────────────────── Route (Tab) Access Matrix ─────────────────────── */

type AccessRole = { id: string; name: string; color: string; permissions: any };
type RouteAccessRow = { role_id: string; route: string };

function RouteAccessMatrix() {
  const [roles, setRoles] = useState<AccessRole[]>([]);
  const [access, setAccess] = useState<RouteAccessRow[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const reload = async () => {
    const [r, a] = await Promise.all([
      supabase.from("custom_roles").select("id, name, color, permissions").order("position", { ascending: false }),
      supabase.from("role_route_access").select("role_id, route"),
    ]);
    setRoles((r.data ?? []) as AccessRole[]);
    setAccess((a.data ?? []) as RouteAccessRow[]);
    if (!selectedRole && r.data && r.data.length) setSelectedRole((r.data[0] as any).id);
  };
  useEffect(() => { reload(); }, []);

  const currentAccess = useMemo(() => new Set(access.filter((a) => a.role_id === selectedRole).map((a) => a.route)), [access, selectedRole]);

  const toggle = async (route: string) => {
    if (!selectedRole) return;
    const has = currentAccess.has(route);
    if (has) {
      await supabase.from("role_route_access").delete().eq("role_id", selectedRole).eq("route", route);
      setAccess((prev) => prev.filter((a) => !(a.role_id === selectedRole && a.route === route)));
    } else {
      await supabase.from("role_route_access").insert({ role_id: selectedRole, route });
      setAccess((prev) => [...prev, { role_id: selectedRole, route }]);
    }
  };

  const toggleGroup = async (routes: string[], grant: boolean) => {
    if (!selectedRole) return;
    if (grant) {
      const toAdd = routes.filter((r) => !currentAccess.has(r));
      if (toAdd.length === 0) return;
      await supabase.from("role_route_access").insert(toAdd.map((r) => ({ role_id: selectedRole, route: r })));
    } else {
      await supabase.from("role_route_access").delete().eq("role_id", selectedRole).in("route", routes);
    }
    reload();
  };

  const role = roles.find((r) => r.id === selectedRole);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <aside className="lg:col-span-1 rounded-xl border border-border bg-card p-3">
        <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Roles</h3>
        {roles.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">Create a role in the <b>Roles</b> tab first.</p>
        ) : roles.map((r) => (
          <button key={r.id} onClick={() => setSelectedRole(r.id)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm ${selectedRole===r.id?"bg-primary/10":"hover:bg-muted"}`}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }} />
            <span style={{ color: r.color }}>{r.name}</span>
            {r.permissions?.admin && <span className="ml-auto rounded bg-primary/20 px-1.5 py-0.5 text-[9px] uppercase text-primary">All</span>}
          </button>
        ))}
      </aside>

      <section className="lg:col-span-3">
        {!role ? <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Select a role to configure tab access.</p> : role.permissions?.admin ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm">This role has <b>Administrator</b> permission — it has access to every tab automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Check the tabs members of <b style={{ color: role.color }}>{role.name}</b> can see. Core pages (Dashboard, Assistant) are always visible.</p>
            {navGroups.map((g) => {
              const groupRoutes = g.items.map((i) => i.to);
              const allSelected = groupRoutes.every((r) => currentAccess.has(r));
              const someSelected = groupRoutes.some((r) => currentAccess.has(r));
              return (
                <div key={g.label} className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</h4>
                    <button onClick={() => toggleGroup(groupRoutes, !allSelected)} className="text-xs text-primary hover:underline">
                      {allSelected ? "Clear all" : "Select all"}{someSelected && !allSelected ? ` (${groupRoutes.filter((r) => currentAccess.has(r)).length}/${groupRoutes.length})` : ""}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {g.items.map((i) => {
                      const has = currentAccess.has(i.to);
                      return (
                        <button key={i.to} onClick={() => toggle(i.to)} className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm ${has ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/30"}`}>
                          <div className={`flex h-4 w-4 items-center justify-center rounded border ${has ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}>
                            {has && <Check className="h-3 w-3" />}
                          </div>
                          <i.icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="flex-1">{i.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─────────────────────── Permission Overrides ─────────────────────── */

type OverrideRow = { id: string; user_id: string; permission: string; granted: boolean; notes: string | null; created_at: string };
type ProfileMini = { id: string; full_name: string | null; email: string | null };

const PERMISSIONS = ["manage_channels","manage_roles","manage_messages","manage_users","manage_billing","manage_domains","view_financials","export_data","admin"];

function PermissionOverrides() {
  const [rows, setRows] = useState<OverrideRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileMini[]>([]);
  const [form, setForm] = useState<{ user_id: string; permission: string; granted: boolean; notes: string }>({ user_id: "", permission: PERMISSIONS[0], granted: true, notes: "" });

  const reload = async () => {
    const [{ data: o }, { data: p }] = await Promise.all([
      supabase.from("admin_permission_overrides").select("id, user_id, permission, granted, notes, created_at").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email").order("full_name"),
    ]);
    setRows((o ?? []) as OverrideRow[]);
    setProfiles((p ?? []) as ProfileMini[]);
    if (!form.user_id && p && p.length) setForm((f) => ({ ...f, user_id: (p[0] as any).id }));
  };
  useEffect(() => { reload(); }, []);

  const add = async () => {
    if (!form.user_id || !form.permission) return;
    await supabase.from("admin_permission_overrides").insert({ user_id: form.user_id, permission: form.permission, granted: form.granted, notes: form.notes || null } as any);
    setForm({ ...form, notes: "" });
    reload();
  };
  const del = async (id: string) => { await supabase.from("admin_permission_overrides").delete().eq("id", id); reload(); };

  const profileLabel = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    return p?.full_name || p?.email || id.slice(0, 8);
  };

  const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">Grant or deny a specific permission to a single user — overrides their role's default. Use sparingly.</p>
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Add override</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className={inputCls}>
            {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
          </select>
          <select value={form.permission} onChange={(e) => setForm({ ...form, permission: e.target.value })} className={inputCls}>
            {PERMISSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={form.granted ? "grant" : "deny"} onChange={(e) => setForm({ ...form, granted: e.target.value === "grant" })} className={inputCls}>
            <option value="grant">Grant</option>
            <option value="deny">Deny</option>
          </select>
          <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputCls} sm:col-span-2`} />
        </div>
        <div className="mt-3"><button onClick={add} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Add override</button></div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-2 text-left">User</th><th className="px-4 py-2 text-left">Permission</th><th className="px-4 py-2 text-left">Effect</th><th className="px-4 py-2 text-left">Notes</th><th className="px-4 py-2"></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-2">{profileLabel(r.user_id)}</td>
                <td className="px-4 py-2 font-mono text-xs">{r.permission}</td>
                <td className="px-4 py-2">{r.granted ? <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700">Granted</span> : <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs text-destructive">Denied</span>}</td>
                <td className="px-4 py-2 text-muted-foreground">{r.notes}</td>
                <td className="px-4 py-2 text-right"><button onClick={() => del(r.id)} className="text-xs text-destructive hover:underline"><Trash2 className="inline h-3 w-3" /></button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">No overrides — role permissions apply as-is.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmailSettings() {
  const [s, setS] = useState<{ from_name: string; reply_to: string; sender_domain: string; default_footer: string; track_opens: boolean; track_clicks: boolean }>({
    from_name: "", reply_to: "", sender_domain: "clovrlab.com", default_footer: "", track_opens: true, track_clicks: true,
  });
  const [rowId, setRowId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("company_email_settings").select("*").limit(1).maybeSingle();
      if (data) {
        setRowId(data.id);
        setS({
          from_name: data.from_name ?? "",
          reply_to: data.reply_to ?? "",
          sender_domain: data.sender_domain ?? "clovrlab.com",
          default_footer: data.default_footer ?? "",
          track_opens: data.track_opens ?? true,
          track_clicks: data.track_clicks ?? true,
        });
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const payload = { ...s, updated_by: u.user?.id, updated_at: new Date().toISOString() };
    if (rowId) {
      await supabase.from("company_email_settings").update(payload).eq("id", rowId);
    } else {
      const { data } = await supabase.from("company_email_settings").insert(payload as any).select().single();
      if (data) setRowId(data.id);
    }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="grid grid-cols-1 md:grid-cols-[220px_1fr] items-start gap-3 border-b border-border py-4">
      <span className="text-sm font-medium text-foreground/90">{label}</span>
      <div>{children}</div>
    </label>
  );

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold">Company email defaults</h2>
      <p className="mb-4 text-sm text-muted-foreground">Applied to outbound email from shared mailboxes and system notifications.</p>
      <Field label="Default from name">
        <input value={s.from_name} onChange={(e) => setS({ ...s, from_name: e.target.value })} placeholder="Clovr Lab" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </Field>
      <Field label="Reply-to address">
        <input value={s.reply_to} onChange={(e) => setS({ ...s, reply_to: e.target.value })} placeholder="hello@clovrlab.com" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </Field>
      <Field label="Sender domain">
        <input value={s.sender_domain} onChange={(e) => setS({ ...s, sender_domain: e.target.value })} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <p className="mt-1 text-xs text-muted-foreground">Verified in Resend. Shared mailboxes (support@, sales@, etc.) send from this domain.</p>
      </Field>
      <Field label="Default footer">
        <textarea value={s.default_footer} onChange={(e) => setS({ ...s, default_footer: e.target.value })} rows={4} placeholder="Appended to outbound company email." className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </Field>
      <Field label="Tracking">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.track_opens} onChange={(e) => setS({ ...s, track_opens: e.target.checked })} /> Track email opens</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.track_clicks} onChange={(e) => setS({ ...s, track_clicks: e.target.checked })} /> Track link clicks</label>
        </div>
      </Field>
      <div className="mt-4 flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-emerald-600">Saved</span>}
        <button disabled={saving} onClick={save} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── General settings ─────────────────────── */

type SettingField = {
  key: string;
  label: string;
  description?: string;
  type?: "text" | "textarea" | "select" | "number";
  options?: string[];
  placeholder?: string;
  group: string;
};

const SETTING_FIELDS: SettingField[] = [
  { group: "Company", key: "legal_name", label: "Legal company name", placeholder: "Clovr Lab, Inc." },
  { group: "Company", key: "display_name", label: "Display name", placeholder: "Clovr Lab" },
  { group: "Company", key: "ein", label: "EIN / tax ID" },
  { group: "Company", key: "website", label: "Website", placeholder: "https://clovrlab.com" },
  { group: "Company", key: "support_email", label: "Support email", placeholder: "support@clovrlab.com" },
  { group: "Company", key: "hq_address", label: "HQ address", type: "textarea" },
  { group: "Company", key: "phone", label: "Main phone", placeholder: "+1 555 555 5555" },
  { group: "Company", key: "fiscal_year_start", label: "Fiscal year start (MM-DD)", placeholder: "01-01" },

  { group: "Locale", key: "timezone", label: "Default timezone", type: "select", options: ["UTC","America/New_York","America/Chicago","America/Denver","America/Los_Angeles","Europe/London","Europe/Berlin","Asia/Tokyo","Asia/Singapore","Australia/Sydney"] },
  { group: "Locale", key: "currency", label: "Default currency", type: "select", options: ["USD","EUR","GBP","CAD","AUD","JPY"] },
  { group: "Locale", key: "week_starts_on", label: "Week starts on", type: "select", options: ["Sunday","Monday"] },
  { group: "Locale", key: "date_format", label: "Date format", type: "select", options: ["MM/DD/YYYY","DD/MM/YYYY","YYYY-MM-DD"] },
  { group: "Locale", key: "measurement_system", label: "Measurement system", type: "select", options: ["metric","imperial"] },

  { group: "Work", key: "work_hours_start", label: "Work day start", placeholder: "09:00" },
  { group: "Work", key: "work_hours_end", label: "Work day end", placeholder: "17:00" },
  { group: "Work", key: "work_days", label: "Working days", placeholder: "Mon,Tue,Wed,Thu,Fri" },
  { group: "Work", key: "pto_days_per_year", label: "Default PTO days / yr", type: "number", placeholder: "15" },
  { group: "Work", key: "sick_days_per_year", label: "Default sick days / yr", type: "number", placeholder: "10" },
  { group: "Work", key: "overtime_threshold_hours", label: "Overtime threshold (hrs/wk)", type: "number", placeholder: "40" },

  { group: "People", key: "default_role", label: "Default role for new hires", type: "select", options: ["employee","manager","engineering","manufacturing","sales","finance","marketing","support","it","hr"] },
  { group: "People", key: "invite_expires_days", label: "Invite expiry (days)", type: "number", placeholder: "7" },
  { group: "People", key: "require_manager_approval", label: "Require manager approval for time off", type: "select", options: ["yes","no"] },
  { group: "People", key: "auto_seed_onboarding", label: "Auto-seed onboarding on invite accept", type: "select", options: ["yes","no"] },
  { group: "People", key: "org_directory_visibility", label: "Directory visibility", type: "select", options: ["everyone","managers","admins"] },

  { group: "Meetings", key: "default_meeting_length", label: "Default meeting length (min)", type: "number", placeholder: "30" },
  { group: "Meetings", key: "auto_log_meeting_time", label: "Auto-log meeting time", type: "select", options: ["yes","no"] },
  { group: "Meetings", key: "meeting_reminder_minutes", label: "Meeting reminder (min before)", type: "number", placeholder: "10" },
  { group: "Meetings", key: "record_meetings_default", label: "Record meetings by default", type: "select", options: ["yes","no"] },

  { group: "Security", key: "session_timeout_hours", label: "Session timeout (hours)", type: "number", placeholder: "24" },
  { group: "Security", key: "require_mfa", label: "Require MFA for admins", type: "select", options: ["yes","no"] },
  { group: "Security", key: "password_min_length", label: "Minimum password length", type: "number", placeholder: "10" },
  { group: "Security", key: "allowed_email_domains", label: "Allowed sign-up domains (comma-sep)", placeholder: "clovrlab.com" },
  { group: "Security", key: "ip_allowlist", label: "IP allowlist (comma-sep, empty = any)", type: "textarea" },

  { group: "Notifications", key: "notify_new_hire", label: "Notify company on new hire", type: "select", options: ["yes","no"] },
  { group: "Notifications", key: "notify_dm_email", label: "Send DM email digest when offline", type: "select", options: ["yes","no"] },
  { group: "Notifications", key: "daily_digest_time", label: "Daily digest time", placeholder: "08:00" },
];

const DEFAULTS: Record<string, string> = {
  timezone: "America/New_York",
  currency: "USD",
  week_starts_on: "Monday",
  date_format: "MM/DD/YYYY",
  measurement_system: "metric",
  work_hours_start: "09:00",
  work_hours_end: "17:00",
  work_days: "Mon,Tue,Wed,Thu,Fri",
  pto_days_per_year: "15",
  sick_days_per_year: "10",
  overtime_threshold_hours: "40",
  default_role: "employee",
  invite_expires_days: "7",
  require_manager_approval: "yes",
  auto_seed_onboarding: "yes",
  org_directory_visibility: "everyone",
  default_meeting_length: "30",
  auto_log_meeting_time: "yes",
  meeting_reminder_minutes: "10",
  record_meetings_default: "no",
  session_timeout_hours: "24",
  require_mfa: "no",
  password_min_length: "10",
  allowed_email_domains: "clovrlab.com",
  fiscal_year_start: "01-01",
  notify_new_hire: "yes",
  notify_dm_email: "yes",
  daily_digest_time: "08:00",
};

function GeneralSettings() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [initial, setInitial] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("admin_settings").select("key, value").eq("category", "company");
      const loaded: Record<string, string> = {};
      for (const r of (data ?? []) as any[]) loaded[r.key] = r.value ?? "";
      // Seed defaults for anything not present in DB
      const merged = { ...DEFAULTS, ...loaded };
      setValues(merged);
      setInitial(merged);
    })();
  }, []);

  const dirty = useMemo(() => Object.keys(values).some((k) => (values[k] ?? "") !== (initial[k] ?? "")), [values, initial]);

  const save = async () => {
    setSaving(true);
    const rows = SETTING_FIELDS
      .map((f) => ({ category: "company", key: f.key, value: values[f.key] ?? "" }))
      .filter((r) => (r.value ?? "").length > 0);
    // Wipe + reinsert for the company category is simplest and predictable.
    await supabase.from("admin_settings").delete().eq("category", "company");
    if (rows.length) await supabase.from("admin_settings").insert(rows);
    setInitial({ ...values });
    setSaving(false);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2500);
  };

  const groups = useMemo(() => {
    const m = new Map<string, SettingField[]>();
    for (const f of SETTING_FIELDS) {
      if (!m.has(f.group)) m.set(f.group, []);
      m.get(f.group)!.push(f);
    }
    return m;
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">These settings power onboarding, meetings, invites, and time tracking across HQ.</p>
        <div className="flex items-center gap-2">
          {savedAt && <span className="text-xs text-emerald-600">Saved ✓</span>}
          <button onClick={save} disabled={!dirty || saving} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {Array.from(groups.entries()).map(([g, fields]) => (
          <div key={g} className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{g}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {fields.map((f) => (
                <label key={f.key} className={`flex flex-col gap-1 ${f.type === "textarea" ? "sm:col-span-2" : ""}`}>
                  <span className="text-xs font-medium text-muted-foreground">{f.label}</span>
                  {f.type === "textarea" ? (
                    <textarea value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} placeholder={f.placeholder} className="min-h-[70px] rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  ) : f.type === "select" ? (
                    <select value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                      <option value="">—</option>
                      {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type === "number" ? "number" : "text"} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} placeholder={f.placeholder} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── Roles & Permissions ─────────────────────── */

type Perm = { manage_channels: boolean; manage_roles: boolean; manage_messages: boolean; admin: boolean };
type Role = { id: string; name: string; color: string; position: number; permissions: Perm };
type Profile = { id: string; full_name: string | null; email: string | null; department: string | null };
type Assignment = { user_id: string; role_id: string };

const DEFAULT_COLOR = "#f97316";

function RolesManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [showAssign, setShowAssign] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");

  const load = async () => {
    const [{ data: r }, { data: p }, { data: a }] = await Promise.all([
      supabase.from("custom_roles").select("*").order("position", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email, department").order("full_name"),
      supabase.from("user_custom_roles").select("user_id, role_id"),
    ]);
    setRoles((r ?? []) as any as Role[]);
    setProfiles((p ?? []) as Profile[]);
    setAssignments((a ?? []) as Assignment[]);
    if (!selected && r && r.length) setSelected((r[0] as any).id);
  };
  useEffect(() => { load(); }, []);

  const selectedRole = roles.find((r) => r.id === selected);
  const assigned = assignments.filter((a) => a.role_id === selected).map((a) => a.user_id);

  const createRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim()) return;
    const maxPos = Math.max(0, ...roles.map((r) => r.position));
    const { data } = await supabase.from("custom_roles").insert({
      name: draftName.trim(),
      color: DEFAULT_COLOR,
      position: maxPos + 1,
      permissions: { manage_channels: false, manage_roles: false, manage_messages: false, admin: false } as any,
    } as any).select().single();
    if (data) { setRoles((prev) => [data as any as Role, ...prev]); setSelected((data as any).id); }
    setDraftName(""); setCreating(false);
  };

  const updateRole = async (patch: Partial<Role>) => {
    if (!selectedRole) return;
    const next = { ...selectedRole, ...patch };
    setRoles((prev) => prev.map((r) => r.id === selectedRole.id ? next : r));
    await supabase.from("custom_roles").update(patch as any).eq("id", selectedRole.id);
  };

  const togglePerm = (k: keyof Perm) => {
    if (!selectedRole) return;
    updateRole({ permissions: { ...selectedRole.permissions, [k]: !selectedRole.permissions[k] } });
  };

  const deleteRole = async () => {
    if (!selectedRole) return;
    if (!confirm(`Delete role "${selectedRole.name}"? Members will lose it.`)) return;
    await supabase.from("custom_roles").delete().eq("id", selectedRole.id);
    setRoles((prev) => prev.filter((r) => r.id !== selectedRole.id));
    setSelected(roles.find((r) => r.id !== selectedRole.id)?.id ?? null);
  };

  const move = async (dir: -1 | 1) => {
    if (!selectedRole) return;
    const sorted = [...roles].sort((a, b) => b.position - a.position);
    const idx = sorted.findIndex((r) => r.id === selectedRole.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    const p1 = selectedRole.position, p2 = swap.position;
    setRoles((prev) => prev.map((r) => r.id === selectedRole.id ? { ...r, position: p2 } : r.id === swap.id ? { ...r, position: p1 } : r));
    await supabase.from("custom_roles").update({ position: p2 } as any).eq("id", selectedRole.id);
    await supabase.from("custom_roles").update({ position: p1 } as any).eq("id", swap.id);
  };

  const toggleAssign = async (userId: string) => {
    if (!selectedRole) return;
    const has = assignments.some((a) => a.user_id === userId && a.role_id === selectedRole.id);
    if (has) {
      await supabase.from("user_custom_roles").delete().eq("user_id", userId).eq("role_id", selectedRole.id);
      setAssignments((prev) => prev.filter((a) => !(a.user_id === userId && a.role_id === selectedRole.id)));
    } else {
      await supabase.from("user_custom_roles").insert({ user_id: userId, role_id: selectedRole.id } as any);
      setAssignments((prev) => [...prev, { user_id: userId, role_id: selectedRole.id }]);
    }
  };

  const rolesSorted = [...roles].sort((a, b) => b.position - a.position);
  const assignedProfiles = profiles.filter((p) => assigned.includes(p.id));
  const availableProfiles = profiles.filter((p) => {
    if (assigned.includes(p.id)) return false;
    const q = assignSearch.toLowerCase();
    if (!q) return true;
    return (p.full_name ?? "").toLowerCase().includes(q) || (p.email ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="flex gap-4">
      <aside className="flex w-64 shrink-0 flex-col rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold uppercase tracking-wider">Roles</h2></div>
          <button onClick={() => setCreating(true)} className="rounded p-1 hover:bg-muted" aria-label="New role"><Plus className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[70vh] flex-1 overflow-y-auto p-2">
          <p className="mb-2 px-2 text-[10px] text-muted-foreground">Higher = higher hierarchy</p>
          {rolesSorted.map((r) => (
            <button key={r.id} onClick={() => setSelected(r.id)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-muted ${selected === r.id ? "bg-primary/10" : ""}`}>
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="truncate" style={{ color: r.color }}>{r.name}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{assignments.filter((a) => a.role_id === r.id).length}</span>
            </button>
          ))}
          {rolesSorted.length === 0 && (
            <div className="p-3">
              <p className="mb-2 text-xs text-muted-foreground">No roles yet.</p>
              <button onClick={() => setCreating(true)} className="w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Create your first role</button>
            </div>
          )}
        </div>
      </aside>

      <section className="flex-1 rounded-xl border border-border bg-card">
        {!selectedRole ? (
          <div className="flex h-full items-center justify-center p-10 text-sm text-muted-foreground">Select or create a role.</div>
        ) : (
          <div className="p-6">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <input value={selectedRole.name} onChange={(e) => updateRole({ name: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-lg font-semibold outline-none focus:border-primary" style={{ color: selectedRole.color }} />
                <div className="flex items-center gap-2">
                  <input type="color" value={selectedRole.color} onChange={(e) => updateRole({ color: e.target.value })} className="h-8 w-12 cursor-pointer rounded border border-border bg-transparent" />
                  <span className="text-xs text-muted-foreground">{selectedRole.color}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => move(-1)} className="rounded border border-border p-1.5 hover:bg-muted" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => move(1)} className="rounded border border-border p-1.5 hover:bg-muted" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
                <button onClick={deleteRole} className="rounded border border-destructive/30 p-1.5 text-destructive hover:bg-destructive/10" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Permissions</h3>
              <div className="space-y-2">
                {([
                  ["admin", "Administrator", "Full access — bypasses every permission check"],
                  ["manage_roles", "Manage roles", "Create, edit, delete, assign roles"],
                  ["manage_channels", "Manage channels", "Create and delete channels + categories"],
                  ["manage_messages", "Manage messages", "Delete any message in channels"],
                ] as const).map(([k, label, desc]) => (
                  <label key={k} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/30">
                    <input type="checkbox" checked={selectedRole.permissions[k]} onChange={() => togglePerm(k)} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Configure which tabs this role can access in the <b>Tab Access</b> tab above.</p>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Members ({assignedProfiles.length})</h3>
                <button onClick={() => setShowAssign(true)} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                  <Users className="h-3 w-3" /> Add members
                </button>
              </div>
              {assignedProfiles.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">No members yet.</p>
              ) : (
                <ul className="space-y-1">
                  {assignedProfiles.map((p) => (
                    <li key={p.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                      <div>
                        <p className="text-sm">{p.full_name || p.email}</p>
                        {p.department && <p className="text-xs text-muted-foreground">{p.department}</p>}
                      </div>
                      <button onClick={() => toggleAssign(p.id)} className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setCreating(false)}>
          <form onSubmit={createRole} className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">New role</h3>
              <button type="button" onClick={() => setCreating(false)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <input autoFocus required value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="e.g. Engineering" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setCreating(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Create</button>
            </div>
          </form>
        </div>
      )}

      {showAssign && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAssign(false)}>
          <div className="flex w-full max-w-md flex-col rounded-xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-semibold">Add members to <span style={{ color: selectedRole.color }}>{selectedRole.name}</span></h3>
              <button onClick={() => setShowAssign(false)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-3">
              <input value={assignSearch} onChange={(e) => setAssignSearch(e.target.value)} placeholder="Search teammates…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div className="max-h-80 overflow-y-auto px-3 pb-3">
              {availableProfiles.length === 0 ? <p className="p-4 text-center text-xs text-muted-foreground">No matches.</p> : availableProfiles.map((p) => (
                <button key={p.id} onClick={() => toggleAssign(p.id)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted">
                  <div>
                    <p className="text-sm">{p.full_name || p.email}</p>
                    {p.department && <p className="text-xs text-muted-foreground">{p.department}</p>}
                  </div>
                  <Check className="h-4 w-4 text-primary opacity-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Onboarding Templates ─────────────────────── */

type Template = { id: string; department: string | null; task: string; category: string | null; days_offset: number; sort_order: number };
const DEPARTMENTS = ["Engineering","Manufacturing","Sales","Marketing","Finance","HR","IT","Support","Operations","Executive"];

function OnboardingTemplates() {
  const [rows, setRows] = useState<Template[]>([]);
  const [form, setForm] = useState<Partial<Template>>({ department: "", task: "", category: "", days_offset: 0, sort_order: 0 });

  const reload = async () => {
    const { data } = await supabase.from("hr_onboarding_templates").select("*").order("department", { nullsFirst: true } as any).order("sort_order");
    setRows((data ?? []) as Template[]);
  };
  useEffect(() => { reload(); }, []);

  const add = async () => {
    if (!form.task) return;
    await supabase.from("hr_onboarding_templates").insert({
      department: form.department || null, task: form.task, category: form.category || null,
      days_offset: Number(form.days_offset ?? 0), sort_order: Number(form.sort_order ?? 0),
    });
    setForm({ department: "", task: "", category: "", days_offset: 0, sort_order: 0 });
    reload();
  };
  const del = async (id: string) => { await supabase.from("hr_onboarding_templates").delete().eq("id", id); reload(); };
  const update = async (id: string, patch: Partial<Template>) => { await supabase.from("hr_onboarding_templates").update(patch).eq("id", id); reload(); };

  const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">Tasks defined here are auto-created for every new hire when they accept an invite. Use <b>Global</b> for company-wide tasks (sign policy, IT setup) and <b>Department</b> for role-specific tasks.</p>

      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Add template task</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <select value={form.department ?? ""} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputCls}>
            <option value="">Global (all)</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input placeholder="Task" value={form.task ?? ""} onChange={(e) => setForm({ ...form, task: e.target.value })} className={`${inputCls} sm:col-span-2`} />
          <input placeholder="Category" value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} />
          <input type="number" placeholder="Days" value={form.days_offset ?? 0} onChange={(e) => setForm({ ...form, days_offset: Number(e.target.value) })} className={inputCls} />
        </div>
        <div className="mt-3">
          <button onClick={add} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> Add task
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-2 text-left">Department</th><th className="px-4 py-2 text-left">Task</th><th className="px-4 py-2 text-left">Category</th><th className="px-4 py-2 text-left">Days after start</th><th className="px-4 py-2"></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-2">{r.department ?? <span className="text-muted-foreground">Global</span>}</td>
                <td className="px-4 py-2"><input defaultValue={r.task} onBlur={(e) => e.target.value !== r.task && update(r.id, { task: e.target.value })} className="w-full bg-transparent" /></td>
                <td className="px-4 py-2"><input defaultValue={r.category ?? ""} onBlur={(e) => update(r.id, { category: e.target.value || null })} className="w-full bg-transparent" /></td>
                <td className="px-4 py-2"><input type="number" defaultValue={r.days_offset} onBlur={(e) => update(r.id, { days_offset: Number(e.target.value) })} className="w-16 bg-transparent" /></td>
                <td className="px-4 py-2 text-right"><button onClick={() => del(r.id)} className="text-xs text-destructive hover:underline"><Trash2 className="inline h-3 w-3" /></button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">No templates yet — add company-wide onboarding tasks above.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
