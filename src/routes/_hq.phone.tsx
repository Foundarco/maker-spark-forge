import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneOff, Search, Mic, MicOff, StickyNote } from "lucide-react";
import { usePhone, formatDuration } from "@/lib/hq/phone";

export const Route = createFileRoute("/_hq/phone")({
  head: () => ({ meta: [{ title: "Phone — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: PhonePage,
});

type Profile = { id: string; full_name: string | null; email: string | null; department: string | null };

function initials(n: string) {
  return n.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function PhonePage() {
  const { active, history, startCall, endCall, toggleMute, updateNotes, autoNotesEnabled, setAutoNotesEnabled } = usePhone();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [q, setQ] = useState("");
  const [, tick] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("profiles").select("id, full_name, email, department").neq("id", u.user.id).order("full_name");
      setProfiles((data ?? []) as Profile[]);
    })();
  }, []);

  useEffect(() => {
    if (!active || active.status !== "active") return;
    const t = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  const filtered = useMemo(() => profiles.filter((p) => {
    const n = (p.full_name || p.email || "").toLowerCase();
    return n.includes(q.toLowerCase()) || (p.department ?? "").toLowerCase().includes(q.toLowerCase());
  }), [profiles, q]);

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl gap-4 px-4 py-6">
      {/* Contacts */}
      <aside className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="mb-3 flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Contacts</h2>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full rounded-md border border-border bg-background pl-7 pr-2 py-1.5 text-xs outline-none focus:border-primary" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((p) => {
            const name = p.full_name || p.email || "Unknown";
            return (
              <div key={p.id} className="flex items-center gap-3 border-b border-border/50 px-4 py-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials(name)}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{name}</p>
                  {p.department && <p className="truncate text-xs text-muted-foreground">{p.department}</p>}
                </div>
                <button
                  onClick={() => startCall(p.id, name)}
                  disabled={!!active}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-40"
                  aria-label={`Call ${name}`}
                >
                  <Phone className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="p-4 text-xs text-muted-foreground">No contacts</p>}
        </div>
      </aside>

      {/* Main */}
      <section className="flex flex-1 flex-col gap-4">
        {/* Active call panel */}
        <div className="rounded-xl border border-border bg-card p-6">
          {active ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">{initials(active.peerName)}</div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-card bg-emerald-500" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{active.peerName}</p>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {active.status === "ringing" ? "Ringing…" : active.status === "active" ? `On call · ${formatDuration(active.startedAt, null)}` : "Ended"}
                      {active.kind === "channel" && " · Channel"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className={`flex h-10 w-10 items-center justify-center rounded-full border ${active.muted ? "bg-muted" : "border-border hover:bg-muted"}`} aria-label="Toggle mute">
                    {active.muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <button onClick={endCall} className="flex h-10 items-center gap-2 rounded-full bg-red-500 px-4 text-sm font-medium text-white hover:bg-red-600">
                    <PhoneOff className="h-4 w-4" /> End call
                  </button>
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Auto-notes</label>
                  <span className="text-[10px] text-muted-foreground">Saved with call history</span>
                </div>
                <textarea
                  value={active.notes}
                  onChange={(e) => updateNotes(e.target.value)}
                  placeholder="Jot notes during the call — action items, decisions, follow-ups…"
                  className="h-28 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <Phone className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm">No active call. Select a contact to start.</p>
            </div>
          )}
        </div>

        {/* History */}
        <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold">Recent calls</h3>
          </div>
          <div className="max-h-full divide-y divide-border/60 overflow-y-auto">
            {history.length === 0 && (
              <p className="p-6 text-center text-xs text-muted-foreground">No call history yet.</p>
            )}
            {history.map((c) => (
              <div key={c.id} className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${c.direction === "outbound" ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"}`}>
                    {c.direction === "outbound" ? <PhoneOutgoing className="h-3.5 w-3.5" /> : <PhoneIncoming className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.peerName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(c.startedAt).toLocaleString()} · {formatDuration(c.startedAt, c.endedAt)}</p>
                  </div>
                  <button onClick={() => startCall(c.peerId, c.peerName, c.kind)} disabled={!!active} className="rounded-full bg-emerald-500 p-1.5 text-white hover:bg-emerald-600 disabled:opacity-40" aria-label="Call back">
                    <Phone className="h-3 w-3" />
                  </button>
                </div>
                {c.notes?.trim() && (
                  <div className="ml-11 mt-2 whitespace-pre-wrap rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    {c.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
