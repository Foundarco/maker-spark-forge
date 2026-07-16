import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/_hq/profile")({
  head: () => ({ meta: [{ title: "Profile — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: p } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      setProfile(p ?? { id: u.user.id, email: u.user.email });
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      setRoles((r ?? []).map((x: any) => x.role));
    })();
  }, []);

  const save = async () => {
    if (!profile) return;
    setSaving(true); setMsg(null);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name, title: profile.title, department: profile.department, phone: profile.phone, avatar_url: profile.avatar_url,
    }).eq("id", profile.id);
    setSaving(false);
    setMsg(error ? error.message : "Saved.");
  };

  if (!profile) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UserIcon className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-semibold">Your profile</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 text-xs text-muted-foreground">Signed in as <span className="font-medium text-foreground">{profile.email}</span></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={profile.full_name ?? ""} onChange={(v) => setProfile({ ...profile, full_name: v })} />
          <Field label="Title" value={profile.title ?? ""} onChange={(v) => setProfile({ ...profile, title: v })} />
          <Field label="Department" value={profile.department ?? ""} onChange={(v) => setProfile({ ...profile, department: v })} />
          <Field label="Phone" value={profile.phone ?? ""} onChange={(v) => setProfile({ ...profile, phone: v })} />
          <Field label="Avatar URL" value={profile.avatar_url ?? ""} onChange={(v) => setProfile({ ...profile, avatar_url: v })} />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={save} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {saving ? "Saving…" : "Save changes"}
          </button>
          {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your roles</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {roles.length === 0 ? (
            <span className="text-sm text-muted-foreground">No roles assigned.</span>
          ) : (
            roles.map((r) => (
              <span key={r} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{r}</span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
    </label>
  );
}
