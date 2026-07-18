import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CallStatus = "ringing" | "connecting" | "active" | "ended";
export type CallKind = "user" | "channel";
export type CallDirection = "outbound" | "inbound";

export type Call = {
  id: string;
  peerId: string;
  peerName: string;
  kind: CallKind;
  direction: CallDirection;
  status: CallStatus;
  startedAt: string;
  endedAt: string | null;
  muted: boolean;
  notes: string;
};

export type IncomingCall = {
  callId: string;
  fromUserId: string;
  fromName: string;
  offer: RTCSessionDescriptionInit;
};

type PhoneCtx = {
  active: Call | null;
  history: Call[];
  incoming: IncomingCall | null;
  autoNotesEnabled: boolean;
  setAutoNotesEnabled: (v: boolean) => void;
  startCall: (peerId: string, peerName: string, kind?: CallKind) => Promise<void>;
  acceptIncoming: () => Promise<void>;
  declineIncoming: () => void;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  updateNotes: (notes: string) => void;
  remoteAudioRef: React.RefObject<HTMLAudioElement>;
};

const Ctx = createContext<PhoneCtx | null>(null);

const HISTORY_KEY = "hq.call.history";
const AUTONOTES_KEY = "hq.phone.autonotes";
const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

export function PhoneProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Call | null>(null);
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);
  const [history, setHistory] = useState<Call[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      return raw.map((c: any) => ({ kind: "user", notes: "", ...c })) as Call[];
    } catch { return []; }
  });
  const [autoNotesEnabled, setAutoNotesEnabledState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(AUTONOTES_KEY) === "1";
  });

  const meIdRef = useRef<string | null>(null);
  const meNameRef = useRef<string>("");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const savedIdsRef = useRef<Set<string>>(new Set());
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const inboxChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const peerChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const peerIdRef = useRef<string | null>(null);
  const callIdRef = useRef<string | null>(null);

  // Persist history / autonotes
  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50))); } catch {}
  }, [history]);

  const setAutoNotesEnabled = useCallback((v: boolean) => {
    setAutoNotesEnabledState(v);
    try { localStorage.setItem(AUTONOTES_KEY, v ? "1" : "0"); } catch {}
  }, []);

  // Bootstrap: get current user + subscribe to inbox channel
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted || !data.user) return;
      meIdRef.current = data.user.id;
      const { data: p } = await supabase.from("profiles").select("full_name, email").eq("id", data.user.id).maybeSingle();
      meNameRef.current = (p as any)?.full_name || (p as any)?.email || "Someone";

      const ch = supabase.channel(`phone:${data.user.id}`, { config: { broadcast: { self: false } } });
      ch.on("broadcast", { event: "offer" }, ({ payload }) => handleOffer(payload));
      ch.on("broadcast", { event: "answer" }, ({ payload }) => handleAnswer(payload));
      ch.on("broadcast", { event: "ice" }, ({ payload }) => handleIce(payload));
      ch.on("broadcast", { event: "end" }, ({ payload }) => handleRemoteEnd(payload));
      ch.subscribe();
      inboxChannelRef.current = ch;
    })();
    return () => {
      mounted = false;
      if (inboxChannelRef.current) supabase.removeChannel(inboxChannelRef.current);
      if (peerChannelRef.current) supabase.removeChannel(peerChannelRef.current);
      cleanupMedia();
    };
  }, []);

  // Send to peer via their inbox channel
  const sendToPeer = useCallback(async (peerId: string, event: string, payload: any) => {
    if (!peerChannelRef.current || peerIdRef.current !== peerId) {
      if (peerChannelRef.current) supabase.removeChannel(peerChannelRef.current);
      const ch = supabase.channel(`phone:${peerId}`);
      await new Promise<void>((res) => {
        ch.subscribe((status) => { if (status === "SUBSCRIBED") res(); });
      });
      peerChannelRef.current = ch;
      peerIdRef.current = peerId;
    }
    await peerChannelRef.current!.send({ type: "broadcast", event, payload });
  }, []);

  const cleanupMedia = () => {
    if (pcRef.current) {
      try { pcRef.current.close(); } catch {}
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    pendingIceRef.current = [];
    if (peerChannelRef.current) {
      supabase.removeChannel(peerChannelRef.current);
      peerChannelRef.current = null;
      peerIdRef.current = null;
    }
  };

  const createPeer = useCallback((remoteId: string, callId: string) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pc.ontrack = (e) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = e.streams[0];
        remoteAudioRef.current.play().catch(() => {});
      }
    };
    pc.onicecandidate = (e) => {
      if (e.candidate && meIdRef.current) {
        sendToPeer(remoteId, "ice", { callId, from: meIdRef.current, candidate: e.candidate.toJSON() });
      }
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setActive((cur) => cur && cur.status !== "active" ? { ...cur, status: "active", startedAt: new Date().toISOString() } : cur);
      } else if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        finishCall();
      }
    };
    pcRef.current = pc;
    return pc;
  }, [sendToPeer]);

  const attachLocalMedia = async (pc: RTCPeerConnection) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = stream;
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    return stream;
  };

  const finishCall = useCallback(() => {
    setActive((cur) => {
      if (!cur) return null;
      if (savedIdsRef.current.has(cur.id)) { cleanupMedia(); return null; }
      savedIdsRef.current.add(cur.id);
      const done: Call = { ...cur, status: "ended", endedAt: new Date().toISOString() };
      // save history + notes outside the setter
      queueMicrotask(async () => {
        setHistory((h) => h.some((x) => x.id === done.id) ? h : [done, ...h].slice(0, 50));
        if (autoNotesEnabled && done.notes.trim()) {
          try {
            const { data: u } = await supabase.auth.getUser();
            if (u.user) {
              await supabase.from("meeting_notes").insert({
                author_id: u.user.id,
                title: `Call with ${done.peerName}`,
                content_md: done.notes,
                meeting_date: done.startedAt.slice(0, 10),
                attendees: done.kind === "user" ? [done.peerId] : [],
                tags: ["call"],
              } as any);
            }
          } catch {}
        }
      });
      cleanupMedia();
      return null;
    });
    callIdRef.current = null;
  }, [autoNotesEnabled]);

  // Inbound: caller sent us an offer
  const handleOffer = useCallback(async (payload: any) => {
    const { callId, from, fromName, offer } = payload || {};
    if (!callId || !from || !offer) return;
    // If already in a call, decline automatically
    if (pcRef.current || active) {
      sendToPeer(from, "end", { callId, from: meIdRef.current, reason: "busy" });
      return;
    }
    setIncoming({ callId, fromUserId: from, fromName: fromName || "Unknown", offer });
  }, [active, sendToPeer]);

  const handleAnswer = useCallback(async (payload: any) => {
    const { answer } = payload || {};
    if (!pcRef.current || !answer) return;
    try {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      for (const c of pendingIceRef.current) { try { await pcRef.current.addIceCandidate(c); } catch {} }
      pendingIceRef.current = [];
      setActive((cur) => cur && cur.status === "ringing" ? { ...cur, status: "connecting" } : cur);
    } catch {}
  }, []);

  const handleIce = useCallback(async (payload: any) => {
    const { candidate } = payload || {};
    if (!candidate) return;
    if (pcRef.current && pcRef.current.remoteDescription) {
      try { await pcRef.current.addIceCandidate(candidate); } catch {}
    } else {
      pendingIceRef.current.push(candidate);
    }
  }, []);

  const handleRemoteEnd = useCallback((_payload: any) => {
    finishCall();
  }, [finishCall]);

  const startCall = useCallback(async (peerId: string, peerName: string, kind: CallKind = "user") => {
    if (active || !meIdRef.current) return;
    const callId = crypto.randomUUID();
    callIdRef.current = callId;
    const call: Call = {
      id: callId,
      peerId, peerName, kind,
      direction: "outbound",
      status: "ringing",
      startedAt: new Date().toISOString(),
      endedAt: null,
      muted: false,
      notes: "",
    };
    setActive(call);
    try {
      const pc = createPeer(peerId, callId);
      await attachLocalMedia(pc);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendToPeer(peerId, "offer", {
        callId, from: meIdRef.current, fromName: meNameRef.current,
        offer: { type: offer.type, sdp: offer.sdp },
      });
    } catch (err) {
      console.error("startCall failed", err);
      finishCall();
    }
  }, [active, createPeer, sendToPeer, finishCall]);

  const acceptIncoming = useCallback(async () => {
    if (!incoming || !meIdRef.current) return;
    const inc = incoming;
    setIncoming(null);
    const call: Call = {
      id: inc.callId,
      peerId: inc.fromUserId,
      peerName: inc.fromName,
      kind: "user",
      direction: "inbound",
      status: "connecting",
      startedAt: new Date().toISOString(),
      endedAt: null,
      muted: false,
      notes: "",
    };
    setActive(call);
    callIdRef.current = inc.callId;
    try {
      const pc = createPeer(inc.fromUserId, inc.callId);
      await attachLocalMedia(pc);
      await pc.setRemoteDescription(new RTCSessionDescription(inc.offer));
      for (const c of pendingIceRef.current) { try { await pc.addIceCandidate(c); } catch {} }
      pendingIceRef.current = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendToPeer(inc.fromUserId, "answer", {
        callId: inc.callId, from: meIdRef.current,
        answer: { type: answer.type, sdp: answer.sdp },
      });
    } catch (err) {
      console.error("acceptIncoming failed", err);
      finishCall();
    }
  }, [incoming, createPeer, sendToPeer, finishCall]);

  const declineIncoming = useCallback(() => {
    if (!incoming || !meIdRef.current) return;
    sendToPeer(incoming.fromUserId, "end", { callId: incoming.callId, from: meIdRef.current, reason: "declined" });
    setIncoming(null);
  }, [incoming, sendToPeer]);

  const endCall = useCallback(async () => {
    const cur = active;
    if (cur && meIdRef.current) {
      try { await sendToPeer(cur.peerId, "end", { callId: cur.id, from: meIdRef.current }); } catch {}
    }
    finishCall();
  }, [active, sendToPeer, finishCall]);

  const toggleMute = useCallback(() => {
    setActive((cur) => {
      if (!cur) return cur;
      const next = !cur.muted;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => { t.enabled = !next; });
      }
      return { ...cur, muted: next };
    });
  }, []);

  const updateNotes = useCallback((notes: string) => {
    setActive((cur) => cur ? { ...cur, notes } : cur);
  }, []);

  return (
    <Ctx.Provider value={{
      active, history, incoming,
      autoNotesEnabled, setAutoNotesEnabled,
      startCall, acceptIncoming, declineIncoming, endCall, toggleMute, updateNotes,
      remoteAudioRef,
    }}>
      {children}
      {/* Hidden audio element for remote stream */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
    </Ctx.Provider>
  );
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
