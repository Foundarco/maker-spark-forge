import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as UserIcon, Settings as SettingsIcon, Bell, Palette, Shield, Globe, LogOut } from "lucide-react";
import { useHQTheme, type HQTheme } from "@/lib/hq/theme";

export const Route = createFileRoute("/_hq/settings")({
  head: () => ({ meta: [{ title: "Settings — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});

type Section = "profile" | "appearance" | "notifications" | "security" | "preferences";

const PREF_KEY = "hq-prefs";

type Prefs = {
  density: "comfortable" | "compact";
  accent: "orange" | "blue" | "green" | "violet";
  language: "en" | "es" | "fr" | "de";
  timezone: string;
  timeFormat: "12h" | "24h";
  weekStart: "sunday" | "monday";
  notifyEmail: boolean;
  notifyDesktop: boolean;
  notifyMentions: boolean;
  notifyAnnouncements: boolean;
  notifyDigest: "off" | "daily" | "weekly";
  soundOn: boolean;
  sidebarCollapsed: boolean;
  showKeyboardHints: boolean;
  betaFeatures: boolean;
};

const DEFAULT_PREFS: Prefs = {
  density: "comfortable",
  accent: "orange",
  language: "en",
  timezone: "America/New_York",
  timeFormat: "12h",
  weekStart: "sunday",
  notifyEmail: true,
  notifyDesktop: true,
  notifyMentions: true,
  notifyAnnouncements: true,
  notifyDigest: "daily",
  soundOn: true,
  sidebarCollapsed: false,
  showKeyboardHints: true,
  betaFeatures: false,
};

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(p: Prefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREF_KEY, JSON.stringify(p));
}

function SettingsPage() {
  const [section, setSection] = useState<Section>("profile");
  const [profile, setProfile] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  const { theme, setTheme } = useHQTheme();

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

  const updatePref = <K extends keyof Prefs>(k: K, v: Prefs[K]) => {
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    savePrefs(next);
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true); setMsg(null);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name, title: profile.title, department: profile.department, phone: profile.phone, avatar_url: profile.avatar_url,
    }).eq("id", profile.id);
    setSaving(false);
    setMsg(error ? error.message : "Saved.");
    setTimeout(() => setMsg(null), 2500);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/hq-login";
  };

  const sections: { id: Section; label: string; icon: any }[] = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Globe },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <SettingsIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account</p>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {sections.map((s) => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
          <button
            onClick={signOut}
            className="mt-4 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </nav>

        <div className="min-w-0">
          {section === "profile" && profile && (
            <Card title="Your profile" description={`Signed in as ${profile.email}`}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" value={profile.full_name ?? ""} onChange={(v) => setProfile({ ...profile, full_name: v })} />
                <Field label="Title" value={profile.title ?? ""} onChange={(v) => setProfile({ ...profile, title: v })} />
                <Field label="Department" value={profile.department ?? ""} onChange={(v) => setProfile({ ...profile, department: v })} />
                <Field label="Phone" value={profile.phone ?? ""} onChange={(v) => setProfile({ ...profile, phone: v })} />
                <div className="sm:col-span-2">
                  <Field label="Avatar URL" value={profile.avatar_url ?? ""} onChange={(v) => setProfile({ ...profile, avatar_url: v })} />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button onClick={saveProfile} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {saving ? "Saving…" : "Save changes"}
                </button>
                {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
              </div>

              <div className="mt-8 border-t border-border pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your roles</h3>
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
            </Card>
          )}

          {section === "appearance" && (
            <Card title="Appearance" description="Customize how HQ looks on this device.">
              <SelectRow
                label="Theme"
                hint="Dashboard defaults to dark. Choose light for a bright workspace."
                value={theme}
                onChange={(v) => setTheme(v as HQTheme)}
                options={[
                  { value: "dark", label: "Dark" },
                  { value: "light", label: "Light" },
                  { value: "system", label: "Match system" },
                ]}
              />
              <SelectRow
                label="Density"
                hint="Compact reduces padding across tables and cards."
                value={prefs.density}
                onChange={(v) => updatePref("density", v as Prefs["density"])}
                options={[
                  { value: "comfortable", label: "Comfortable" },
                  { value: "compact", label: "Compact" },
                ]}
              />
              <SelectRow
                label="Accent color"
                value={prefs.accent}
                onChange={(v) => updatePref("accent", v as Prefs["accent"])}
                options={[
                  { value: "orange", label: "Clovr Orange" },
                  { value: "blue", label: "Blue" },
                  { value: "green", label: "Green" },
                  { value: "violet", label: "Violet" },
                ]}
              />
              <ToggleRow
                label="Collapse sidebar by default"
                hint="Hide labels on the sidebar to save space."
                value={prefs.sidebarCollapsed}
                onChange={(v) => updatePref("sidebarCollapsed", v)}
              />
              <ToggleRow
                label="Show keyboard shortcut hints"
                value={prefs.showKeyboardHints}
                onChange={(v) => updatePref("showKeyboardHints", v)}
              />
            </Card>
          )}

          {section === "notifications" && (
            <Card title="Notifications" description="Control what reaches you and how.">
              <ToggleRow label="Email notifications" value={prefs.notifyEmail} onChange={(v) => updatePref("notifyEmail", v)} />
              <ToggleRow label="Desktop notifications" value={prefs.notifyDesktop} onChange={(v) => updatePref("notifyDesktop", v)} />
              <ToggleRow label="Mentions & replies" value={prefs.notifyMentions} onChange={(v) => updatePref("notifyMentions", v)} />
              <ToggleRow label="Company announcements" value={prefs.notifyAnnouncements} onChange={(v) => updatePref("notifyAnnouncements", v)} />
              <ToggleRow label="Notification sound" value={prefs.soundOn} onChange={(v) => updatePref("soundOn", v)} />
              <SelectRow
                label="Email digest"
                value={prefs.notifyDigest}
                onChange={(v) => updatePref("notifyDigest", v as Prefs["notifyDigest"])}
                options={[
                  { value: "off", label: "Off" },
                  { value: "daily", label: "Daily summary" },
                  { value: "weekly", label: "Weekly summary" },
                ]}
              />
            </Card>
          )}

          {section === "preferences" && (
            <Card title="Preferences" description="Localization and workspace defaults.">
              <SelectRow
                label="Language"
                value={prefs.language}
                onChange={(v) => updatePref("language", v as Prefs["language"])}
                options={[
                  { value: "en", label: "English" },
                  { value: "es", label: "Español" },
                  { value: "fr", label: "Français" },
                  { value: "de", label: "Deutsch" },
                ]}
              />
              <SelectRow
                label="Timezone"
                value={prefs.timezone}
                onChange={(v) => updatePref("timezone", v)}
                options={[
                  { value: "America/New_York", label: "Eastern (New York)" },
                  { value: "America/Chicago", label: "Central (Chicago)" },
                  { value: "America/Denver", label: "Mountain (Denver)" },
                  { value: "America/Los_Angeles", label: "Pacific (Los Angeles)" },
                  { value: "Europe/London", label: "London" },
                  { value: "Europe/Berlin", label: "Berlin" },
                  { value: "Asia/Tokyo", label: "Tokyo" },
                ]}
              />
              <SelectRow
                label="Time format"
                value={prefs.timeFormat}
                onChange={(v) => updatePref("timeFormat", v as Prefs["timeFormat"])}
                options={[
                  { value: "12h", label: "12-hour" },
                  { value: "24h", label: "24-hour" },
                ]}
              />
              <SelectRow
                label="Week starts on"
                value={prefs.weekStart}
                onChange={(v) => updatePref("weekStart", v as Prefs["weekStart"])}
                options={[
                  { value: "sunday", label: "Sunday" },
                  { value: "monday", label: "Monday" },
                ]}
              />
              <ToggleRow
                label="Beta features"
                hint="Enable in-progress modules and experiments."
                value={prefs.betaFeatures}
                onChange={(v) => updatePref("betaFeatures", v)}
              />
            </Card>
          )}

          {section === "security" && (
            <Card title="Security" description="Manage authentication for your account.">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium">Password</p>
                <p className="mt-1 text-xs text-muted-foreground">Send yourself a reset link over email.</p>
                <button
                  onClick={async () => {
                    if (!profile?.email) return;
                    const { error } = await supabase.auth.resetPasswordForEmail(profile.email);
                    setMsg(error ? error.message : "Password reset email sent.");
                    setTimeout(() => setMsg(null), 3000);
                  }}
                  className="mt-3 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  Send reset email
                </button>
                {msg && <p className="mt-2 text-xs text-muted-foreground">{msg}</p>}
              </div>
              <div className="mt-4 rounded-lg border border-border p-4">
                <p className="text-sm font-medium">Active session</p>
                <p className="mt-1 text-xs text-muted-foreground">Sign out of this device.</p>
                <button
                  onClick={signOut}
                  className="mt-3 rounded-lg border border-destructive/50 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                >
                  Sign out
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5 space-y-4">{children}</div>
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

function ToggleRow({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-border/60 pt-4 first:border-0 first:pt-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function SelectRow({ label, hint, value, onChange, options }: { label: string; hint?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-4 first:border-0 first:pt-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
