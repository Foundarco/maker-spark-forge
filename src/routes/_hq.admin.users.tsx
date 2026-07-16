import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Mail, Trash2, Copy } from "lucide-react";

const ROLES = ["super_admin","admin","manager","employee","engineering","manufacturing","sales","finance","hr","it","support","marketing"] as const;

export const Route = createFileRoute("/_hq/admin/users")({
  head: () => ({ meta: [{ title: "Users — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/hq-login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    const rs = (roles ?? []).map((r: any) => r.role);
    if (!(rs.includes("super_admin") || rs.includes("admin"))) throw redirect({ to: "/dashboard" });
  },
  component: AdminUsers,
});

type Invite = { id: string; email: string; role: string; department: string | null; expires_at: string; accepted_at: string | null; created_at: string };
type Profile = { id: string; email: string | null; full_name: string | null; department: string | null; created_at: string; roles?: string[] };

function AdminUsers() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("employee");
  const [department, setDepartment] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const { data: inv } = await supabase.from("invites").select("*").order("created_at", { ascending: false });
    setInvites((inv ?? []) as Invite[]);
    const { data: prof } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: allRoles } = await supabase.from("user_roles").select("user_id, role");
    const roleMap = new Map<string, string[]>();
    for (const r of allRoles ?? []) {
      const list = roleMap.get(r.user_id) ?? [];
      list.push(r.role);
      roleMap.set(r.user_id, list);
    }
    setUsers((prof ?? []).map((p: any) => ({ ...p, roles: roleMap.get(p.id) ?? [] })) as Profile[]);
  };

  useEffect(() => { load(); }, []);

  const invite = async () => {
    if (!email.trim()) return;
    setMsg(null);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("invites").insert({
      email: email.trim().toLowerCase(),
      role: role as any,
      department: department || null,
      full_name: fullName || null,
      invited_by: u.user?.id,
    });
    if (error) { setMsg(error.message); return; }
    setEmail(""); setDepartment(""); setFullName("");
    setMsg("Invite created. Send them the sign-up link to /hq-login and they'll accept the account there.");
    load();
  };

  const revoke = async (id: string) => {
    await supabase.from("invites").delete().eq("id", id);
    load();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Users className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-semibold">Users & Invites</h1>
      </div>

      <div className="mb-8 rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Invite a new user</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@company.com" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button onClick={invite} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Mail className="h-4 w-4" /> Send invite
          </button>
          {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pending invites</h2>
        {invites.filter((i) => !i.accepted_at).length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No pending invites.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Expires</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {invites.filter((i) => !i.accepted_at).map((i) => (
                  <tr key={i.id} className="border-t border-border">
                    <td className="px-4 py-2">{i.email}</td>
                    <td className="px-4 py-2"><span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{i.role}</span></td>
                    <td className="px-4 py-2">{i.department ?? "—"}</td>
                    <td className="px-4 py-2 text-muted-foreground">{new Date(i.expires_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => revoke(i.id)} className="text-xs text-destructive hover:underline"><Trash2 className="inline h-3 w-3" /> Revoke</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active users</h2>
        {users.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No users yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Roles</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-2">{u.full_name ?? "—"}</td>
                    <td className="px-4 py-2 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-2">{u.department ?? "—"}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {(u.roles ?? []).map((r) => (
                          <span key={r} className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{r}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
