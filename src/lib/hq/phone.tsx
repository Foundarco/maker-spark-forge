import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type CallStatus = "ringing" | "active" | "ended";

export type Call = {
  id: string;
  peerId: string;
  peerName: string;
  direction: "outbound" | "inbound";
  status: CallStatus;
  startedAt: string;
  endedAt: string | null;
  muted: boolean;
};

type PhoneCtx = {
  active: Call | null;
  history: Call[];
  startCall: (peerId: string, peerName: string) => void;
  endCall: () => void;
  toggleMute: () => void;
};

const Ctx = createContext<PhoneCtx | null>(null);

export function PhoneProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Call | null>(null);
  const [history, setHistory] = useState<Call[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("hq.call.history") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem("hq.call.history", JSON.stringify(history.slice(0, 50))); } catch {}
  }, [history]);

  const startCall = useCallback((peerId: string, peerName: string) => {
    const c: Call = {
      id: crypto.randomUUID(),
      peerId, peerName,
      direction: "outbound",
      status: "ringing",
      startedAt: new Date().toISOString(),
      endedAt: null,
      muted: false,
    };
    setActive(c);
    // Simulate answered after 1.2s
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

  return <Ctx.Provider value={{ active, history, startCall, endCall, toggleMute }}>{children}</Ctx.Provider>;
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
