import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type CallStatus = "ringing" | "active" | "ended";
export type CallKind = "user" | "channel";

export type Call = {
  id: string;
  peerId: string;
  peerName: string;
  kind: CallKind;
  direction: "outbound" | "inbound";
  status: CallStatus;
  startedAt: string;
  endedAt: string | null;
  muted: boolean;
  notes: string;
};

type PhoneCtx = {
  active: Call | null;
  history: Call[];
  startCall: (peerId: string, peerName: string, kind?: CallKind) => void;
  endCall: () => void;
  toggleMute: () => void;
  updateNotes: (notes: string) => void;
};

const Ctx = createContext<PhoneCtx | null>(null);

export function PhoneProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Call | null>(null);
  const [history, setHistory] = useState<Call[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = JSON.parse(localStorage.getItem("hq.call.history") || "[]");
      return raw.map((c: any) => ({ kind: "user", notes: "", ...c })) as Call[];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem("hq.call.history", JSON.stringify(history.slice(0, 50))); } catch {}
  }, [history]);

  const startCall = useCallback((peerId: string, peerName: string, kind: CallKind = "user") => {
    const c: Call = {
      id: crypto.randomUUID(),
      peerId, peerName, kind,
      direction: "outbound",
      status: "ringing",
      startedAt: new Date().toISOString(),
      endedAt: null,
      muted: false,
      notes: "",
    };
    setActive(c);
    // Auto-answer after 1.2s (simulated)
    setTimeout(() => setActive((cur) => cur && cur.id === c.id ? { ...cur, status: "active" } : cur), 1200);
  }, []);

  const endCall = useCallback(() => {
    setActive((cur) => {
      if (!cur) return null;
      const done: Call = { ...cur, status: "ended", endedAt: new Date().toISOString() };
      setHistory((h) => [done, ...h].slice(0, 50));
      return null;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setActive((cur) => cur ? { ...cur, muted: !cur.muted } : cur);
  }, []);

  const updateNotes = useCallback((notes: string) => {
    setActive((cur) => cur ? { ...cur, notes } : cur);
  }, []);

  return <Ctx.Provider value={{ active, history, startCall, endCall, toggleMute, updateNotes }}>{children}</Ctx.Provider>;
}

export function usePhone() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePhone must be used within PhoneProvider");
  return c;
}

export function formatDuration(start: string, end: string | null) {
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const sec = Math.max(0, Math.floor((e - s) / 1000));
  const m = Math.floor(sec / 60);
  const r = sec % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
