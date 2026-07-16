import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Plus, Trash2, ArrowUp, ArrowDown, Users, X, Check } from "lucide-react";

export const Route = createFileRoute("/_hq/admin/roles")({
  head: () => ({ meta: [{ title: "Roles — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/hq-login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    const rs = (roles ?? []).map((r: any) => r.role);
    if (!(rs.includes("super_admin") || rs.includes("admin"))) throw redirect({ to: "/dashboard" });
  },
  component: RolesAdmin,
});

type Perm = { manage_channels: boolean; manage_roles: boolean; manage_messages: boolean; admin: boolean };
type Role = { id: string; name: string; color: string; position: number; permissions: Perm };
type Profile = { id: string; full_name: string | null; email: string | null; department: string | null };
type Assignment = { user_id: string; role_id: string };

const DEFAULT_COLOR = "#f97316";

function RolesAdmin() {
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
    <div className="mx-auto flex h-full w-full max-w-7xl gap-4 px-4 py-6">
      <aside className="flex w-64 shrink-0 flex-col rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold uppercase tracking-wider">Roles</h2></div>
          <button onClick={() => setCreating(true)} className="rounded p-1 hover:bg-muted" aria-label="New role"><Plus className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <p className="mb-2 px-2 text-[10px] text-muted-foreground">Higher = higher in the hierarchy</p>
          {rolesSorted.map((r) => (
            <button key={r.id} onClick={() => setSelected(r.id)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-muted ${selected === r.id ? "bg-primary/10" : ""}`}>
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="truncate" style={{ color: r.color }}>{r.name}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{assignments.filter((a) => a.role_id === r.id).length}</span>
            </button>
          ))}
          {rolesSorted.length === 0 && <p className="p-2 text-xs text-muted-foreground">No roles yet.</p>}
        </div>
      </aside>

      <section className="flex flex-1 flex-col rounded-xl border border-border bg-card">
        {!selectedRole ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Select or create a role.</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
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
