import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { X, Mail, Building2, MessageSquare, User as UserIcon, Phone, Video, StickyNote } from "lucide-react";
import { useSlackSettings, slackLink } from "@/lib/hq/slack";
import { usePhone } from "@/lib/hq/phone";

type Profile = { id: string; full_name: string | null; email: string | null; department: string | null };
type Role = { id: string; name: string; color: string; position: number };

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export function ProfilePopover({ userId, onClose, anchor }: { userId: string; onClose: () => void; anchor?: { x: number; y: number } }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, department").eq("id", userId).maybeSingle(),
        supabase.from("user_custom_roles").select("custom_roles(id, name, color, position)").eq("user_id", userId),
      ]);
      setProfile(p as Profile | null);
      setRoles(((r ?? []) as any[]).map((x) => x.custom_roles).filter(Boolean).sort((a, b) => b.position - a.position));
    })();
  }, [userId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const name = profile?.full_name || profile?.email || "Loading…";
  const navigate = useNavigate();
  const style: React.CSSProperties = anchor
    ? { position: "fixed", top: anchor.y, left: anchor.x, zIndex: 60 }
    : { position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", zIndex: 60 };

  const { startCall, active } = usePhone();
  const slack = useSlackSettings();
  const openSlack = () => {
    const url = slackLink(slack);
    onClose();
    if (url) window.open(url, "_blank", "noopener");
  };
  const call = () => {
    if (!profile || active) return;
    onClose();
    startCall(userId, name, "user");
  };
  const meet = async () => {
    if (!profile) return;
    onClose();
    const { createInstantMeeting } = await import("@/lib/hq/instant-meeting");
    const id = await createInstantMeeting(`Meeting with ${name}`, [userId]);
    if (id) navigate({ to: "/meeting/$id", params: { id } });
  };
  const notes = () => {
    onClose();
    navigate({ to: "/meeting-notes" });
  };

  return (
    <div ref={boxRef} style={style} className="w-72 rounded-xl border border-border bg-card p-4 shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{initials(name)}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{name}</p>
            {profile?.department && <p className="flex items-center gap-1 truncate text-xs text-muted-foreground"><Building2 className="h-3 w-3" />{profile.department}</p>}
          </div>
        </div>
        <button onClick={onClose} className="rounded p-1 hover:bg-muted" aria-label="Close"><X className="h-4 w-4" /></button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={openSlack}
          disabled={!slack.workspaceUrl}
          title={slack.workspaceUrl ? "Message on Slack" : "Slack workspace not configured"}
          className="flex items-center justify-center gap-1 rounded-lg bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          <MessageSquare className="h-3 w-3" /> Slack
        </button>
        <button onClick={call} disabled={!profile || !!active} className="flex items-center justify-center gap-1 rounded-lg bg-emerald-500 px-2 py-1.5 text-xs font-medium text-white disabled:opacity-50">
          <Phone className="h-3 w-3" /> Call
        </button>
        <button onClick={meet} className="flex items-center justify-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs hover:bg-muted">
          <Video className="h-3 w-3" /> Meeting
        </button>
        <button onClick={notes} className="flex items-center justify-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs hover:bg-muted">
          <StickyNote className="h-3 w-3" /> Notes
        </button>
        {profile?.email ? (
          <a href={`mailto:${profile.email}`} className="col-span-2 flex items-center justify-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs hover:bg-muted">
            <Mail className="h-3 w-3" /> Email
          </a>
        ) : null}
      </div>

      {profile?.email && (
        <p className="mt-2 flex items-center gap-1 truncate text-[11px] text-muted-foreground"><UserIcon className="h-3 w-3" />{profile.email}</p>
      )}

      {roles.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Roles</p>
          <div className="flex flex-wrap gap-1">
            {roles.map((r) => (
              <span key={r.id} className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `${r.color}22`, color: r.color, borderColor: r.color }}>
                {r.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
