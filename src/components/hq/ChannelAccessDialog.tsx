import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, UserPlus, Shield, Trash2, Loader2 } from "lucide-react";

type Profile = { id: string; full_name: string | null; email: string | null; department: string | null };
type Role = { id: string; name: string; color: string; position: number };
type Member = { user_id: string };
type RoleAccess = { role_id: string };

export function ChannelAccessDialog({ channelId, channelName, onClose }: { channelId: string; channelName: string; onClose: () => void }) {
  const [tab, setTab] = useState<"users" | "roles">("users");
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [rolesAccess, setRolesAccess] = useState<RoleAccess[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userQuery, setUserQuery] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data: mem }, { data: ra }, { data: profs }, { data: rls }] = await Promise.all([
      supabase.from("channel_members").select("user_id").eq("channel_id", channelId),
      supabase.from("channel_role_access").select("role_id").eq("channel_id", channelId),
      supabase.from("profiles").select("id, full_name, email, department").order("full_name"),
      supabase.from("custom_roles").select("id, name, color, position").order("position", { ascending: false }),
    ]);
    setMembers((mem ?? []) as Member[]);
    setRolesAccess((ra ?? []) as RoleAccess[]);
    setAllProfiles((profs ?? []) as Profile[]);
    setAllRoles((rls ?? []) as Role[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [channelId]);

  const addUser = async (uid: string) => {
    setMembers((prev) => [...prev, { user_id: uid }]);
    const { error } = await supabase.from("channel_members").insert({ channel_id: channelId, user_id: uid });
    if (error) { alert(error.message); setMembers((prev) => prev.filter((m) => m.user_id !== uid)); }
  };
  const removeUser = async (uid: string) => {
    setMembers((prev) => prev.filter((m) => m.user_id !== uid));
    await supabase.from("channel_members").delete().eq("channel_id", channelId).eq("user_id", uid);
  };
  const addRole = async (rid: string) => {
    setRolesAccess((prev) => [...prev, { role_id: rid }]);
    const { error } = await supabase.from("channel_role_access").insert({ channel_id: channelId, role_id: rid });
    if (error) { alert(error.message); setRolesAccess((prev) => prev.filter((r) => r.role_id !== rid)); }
  };
  const removeRole = async (rid: string) => {
    setRolesAccess((prev) => prev.filter((r) => r.role_id !== rid));
    await supabase.from("channel_role_access").delete().eq("channel_id", channelId).eq("role_id", rid);
  };

  const memberIds = new Set(members.map((m) => m.user_id));
  const roleIds = new Set(rolesAccess.map((r) => r.role_id));
  const filteredProfiles = allProfiles.filter((p) => {
    const label = `${p.full_name ?? ""} ${p.email ?? ""} ${p.department ?? ""}`.toLowerCase();
    return userQuery ? label.includes(userQuery.toLowerCase()) : true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="font-semibold">Access · #{channelName}</h3>
            <p className="text-xs text-muted-foreground">Grant this private channel to specific people or roles.</p>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex border-b border-border">
          <button onClick={() => setTab("users")} className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider ${tab === "users" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}><UserPlus className="mr-1 inline h-3 w-3" /> Users</button>
          <button onClick={() => setTab("roles")} className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider ${tab === "roles" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}><Shield className="mr-1 inline h-3 w-3" /> Roles</button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : tab === "users" ? (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Has access ({members.length})</p>
                {members.length === 0 && <p className="text-xs text-muted-foreground">No users added yet.</p>}
                <div className="space-y-1">
                  {members.map((m) => {
                    const p = allProfiles.find((x) => x.id === m.user_id);
                    return (
                      <div key={m.user_id} className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm">
                        <div>
                          <p className="text-sm">{p?.full_name || p?.email || m.user_id.slice(0, 8)}</p>
                          {p?.department && <p className="text-[10px] text-muted-foreground">{p.department}</p>}
                        </div>
                        <button aria-label="Delete" onClick={() => removeUser(m.user_id)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Add user</p>
                <input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Search by name, email, department…" className="mb-2 w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary" />
                <div className="max-h-56 space-y-1 overflow-y-auto">
                  {filteredProfiles.filter((p) => !memberIds.has(p.id)).slice(0, 30).map((p) => (
                    <button key={p.id} onClick={() => addUser(p.id)} className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm hover:bg-muted">
                      <div>
                        <p>{p.full_name || p.email || "Unnamed"}</p>
                        {p.department && <p className="text-[10px] text-muted-foreground">{p.department}</p>}
                      </div>
                      <UserPlus className="h-3 w-3 text-primary" />
                    </button>
                  ))}
                  {filteredProfiles.filter((p) => !memberIds.has(p.id)).length === 0 && <p className="p-2 text-xs text-muted-foreground">No more users to add.</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Roles with access ({rolesAccess.length})</p>
                {rolesAccess.length === 0 && <p className="text-xs text-muted-foreground">No roles granted yet.</p>}
                <div className="flex flex-wrap gap-2">
                  {rolesAccess.map((r) => {
                    const role = allRoles.find((x) => x.id === r.role_id);
                    if (!role) return null;
                    return (
                      <span key={r.role_id} className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs" style={{ borderColor: role.color, color: role.color, backgroundColor: `${role.color}18` }}>
                        {role.name}
                        <button onClick={() => removeRole(r.role_id)} className="rounded p-0.5 hover:bg-background/50"><X className="h-3 w-3" /></button>
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Add role</p>
                <div className="space-y-1">
                  {allRoles.filter((r) => !roleIds.has(r.id)).map((r) => (
                    <button key={r.id} onClick={() => addRole(r.id)} className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm hover:bg-muted">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                        {r.name}
                      </span>
                      <Shield className="h-3 w-3 text-primary" />
                    </button>
                  ))}
                  {allRoles.filter((r) => !roleIds.has(r.id)).length === 0 && <p className="p-2 text-xs text-muted-foreground">All roles already granted.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
