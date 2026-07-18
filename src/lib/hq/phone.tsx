import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { playRingback, playIncomingRing, stopAllCallSounds, playSound } from "@/lib/hq/sounds";

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

export type ChannelCallState = {
  channelId: string;
  channelName: string;
  sessionId: string;
  isHost: boolean;
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
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
  channelCall: ChannelCallState | null;
  startChannelCall: (channelId: string, channelName: string) => Promise<void>;
  joinChannelCall: (channelId: string, channelName: string, sessionId?: string) => Promise<void>;
  leaveChannelCall: () => Promise<void>;
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
  // Cache one long-lived peer-inbox channel per peer id, keyed by peerId.
  // Concurrent onicecandidate + offer/answer would previously race on a
  // single ref, creating multiple channels and dropping signaling messages.
  const peerChannelsRef = useRef<Map<string, Promise<ReturnType<typeof supabase.channel>>>>(new Map());
  const callIdRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const recognitionActiveRef = useRef(false);
  // Channel call presence (multi-user "in call" indicator; separate from 1:1 audio)
  const [channelCall, setChannelCallState] = useState<ChannelCallState | null>(null);
  const channelCallChRef = useRef<any>(null);
  const channelCallSessionIdRef = useRef<string | null>(null);
  const channelPeerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRemoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const channelPendingIceRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const channelCallRef = useRef<ChannelCallState | null>(null);

  useEffect(() => {
    channelCallRef.current = channelCall;
  }, [channelCall]);

  // Append a transcribed chunk to the active call's notes
  const appendNotes = useCallback((text: string) => {
    if (!text.trim()) return;
    setActive((cur) => cur ? { ...cur, notes: (cur.notes ? cur.notes.trimEnd() + " " : "") + text.trim() } : cur);
  }, []);

  const startRecognition = useCallback(() => {
    if (recognitionActiveRef.current) return;
    const SR = (typeof window !== "undefined") && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SR) return; // unsupported browser
    try {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = navigator.language || "en-US";
      rec.onresult = (e: any) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) appendNotes(r[0]?.transcript || "");
        }
      };
      rec.onerror = () => {};
      rec.onend = () => {
        // Auto-restart while a call is still active
        if (recognitionActiveRef.current) { try { rec.start(); } catch {} }
      };
      rec.start();
      recognitionRef.current = rec;
      recognitionActiveRef.current = true;
    } catch {}
  }, [appendNotes]);

  const stopRecognition = useCallback(() => {
    recognitionActiveRef.current = false;
    const rec = recognitionRef.current;
    if (rec) { try { rec.stop(); } catch {} }
    recognitionRef.current = null;
  }, []);

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
      // cleanupMedia below also drops any peer channels
      cleanupMedia();
    };
  }, []);

  // Send to peer via their inbox channel. Race-safe: the first call for a
  // given peer creates and subscribes the channel; concurrent calls reuse
  // the same promise so ICE and offer/answer don't stomp on each other.
  const getPeerChannel = useCallback((peerId: string) => {
    const cache = peerChannelsRef.current;
    let p = cache.get(peerId);
    if (!p) {
      p = new Promise((resolve) => {
        const ch = supabase.channel(`phone:${peerId}`);
        ch.subscribe((status) => { if (status === "SUBSCRIBED") resolve(ch); });
      });
      cache.set(peerId, p);
    }
    return p;
  }, []);

  const sendToPeer = useCallback(async (peerId: string, event: string, payload: any) => {
    const ch = await getPeerChannel(peerId);
    await ch.send({ type: "broadcast", event, payload });
  }, [getPeerChannel]);

  const dropPeerChannels = () => {
    for (const p of peerChannelsRef.current.values()) {
      p.then((ch) => { try { supabase.removeChannel(ch); } catch {} });
    }
    peerChannelsRef.current.clear();
  };

  const cleanupChannelMesh = () => {
    for (const pc of channelPeerConnectionsRef.current.values()) {
      try { pc.close(); } catch {}
    }
    channelPeerConnectionsRef.current.clear();
    for (const audio of channelRemoteAudiosRef.current.values()) {
      try { audio.pause(); audio.srcObject = null; audio.remove(); } catch {}
    }
    channelRemoteAudiosRef.current.clear();
    channelPendingIceRef.current.clear();
  };

  const cleanupMedia = () => {
    if (pcRef.current) {
      try { pcRef.current.close(); } catch {}
      pcRef.current = null;
    }
    cleanupChannelMesh();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    pendingIceRef.current = [];
    dropPeerChannels();
    stopAllCallSounds();
    stopRecognition();
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

  const ensureLocalStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = stream;
    return stream;
  }, []);

  const attachLocalMedia = async (pc: RTCPeerConnection) => {
    const stream = await ensureLocalStream();
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

  const disconnectChannelPresence = useCallback(async () => {
    if (channelCallChRef.current) {
      try { await channelCallChRef.current.send({ type: "broadcast", event: "bye", payload: { user_id: meIdRef.current, session_id: channelCallSessionIdRef.current } }); } catch {}
      try { await channelCallChRef.current.untrack(); } catch {}
      supabase.removeChannel(channelCallChRef.current);
      channelCallChRef.current = null;
    }
    channelCallSessionIdRef.current = null;
    channelCallRef.current = null;
    setChannelCallState(null);
    cleanupChannelMesh();
  }, []);

  const endCall = useCallback(async () => {
    const cur = active;
    if (cur?.kind === "channel") {
      await disconnectChannelPresence();
      finishCall();
      return;
    }
    if (cur && meIdRef.current) {
      try { await sendToPeer(cur.peerId, "end", { callId: cur.id, from: meIdRef.current }); } catch {}
    }
    finishCall();
  }, [active, sendToPeer, finishCall, disconnectChannelPresence]);

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

  // Ringing/connect/end sounds tied to call state
  const prevStatusRef = useRef<CallStatus | null>(null);
  useEffect(() => {
    const status = active?.status ?? null;
    const prev = prevStatusRef.current;
    if (active?.direction === "outbound" && status === "ringing") {
      playRingback();
    } else {
      stopAllCallSounds();
      if (active && status === "active" && prev !== "active") playSound("call-connect");
    }
    if (!active && prev && prev !== "ended") playSound("call-end");
    prevStatusRef.current = status;
  }, [active?.status, active?.direction, active]);

  // Incoming ring
  useEffect(() => {
    if (incoming) playIncomingRing();
    else stopAllCallSounds();
  }, [incoming]);

  // Speech-to-text transcription during active call when auto-notes is on
  useEffect(() => {
    if (active?.status === "active" && autoNotesEnabled) startRecognition();
    else stopRecognition();
  }, [active?.status, autoNotesEnabled, startRecognition, stopRecognition]);


  // -------------------- Channel call (multi-user presence room) --------------------
  const getOrCreateChannelPeer = useCallback(async (remoteId: string, sessionId: string, ch: any) => {
    if (!meIdRef.current || remoteId === meIdRef.current) return null;
    const existing = channelPeerConnectionsRef.current.get(remoteId);
    if (existing) return existing;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        ch.send({ type: "broadcast", event: "mesh-ice", payload: { session_id: sessionId, from: meIdRef.current, to: remoteId, candidate: e.candidate.toJSON() } });
      }
    };
    pc.ontrack = (e) => {
      let audio = channelRemoteAudiosRef.current.get(remoteId);
      if (!audio) {
        audio = new Audio();
        audio.autoplay = true;
        audio.playsInline = true;
        audio.className = "hidden";
        document.body.appendChild(audio);
        channelRemoteAudiosRef.current.set(remoteId, audio);
      }
      audio.srcObject = e.streams[0];
      audio.play().catch(() => {});
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        try { pc.close(); } catch {}
        channelPeerConnectionsRef.current.delete(remoteId);
        const audio = channelRemoteAudiosRef.current.get(remoteId);
        if (audio) { try { audio.pause(); audio.srcObject = null; audio.remove(); } catch {} }
        channelRemoteAudiosRef.current.delete(remoteId);
      }
    };

    const stream = await ensureLocalStream();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    channelPeerConnectionsRef.current.set(remoteId, pc);
    return pc;
  }, [ensureLocalStream]);

  const makeChannelOffer = useCallback(async (remoteId: string, sessionId: string, ch: any) => {
    const pc = await getOrCreateChannelPeer(remoteId, sessionId, ch);
    if (!pc || pc.signalingState !== "stable") return;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await ch.send({ type: "broadcast", event: "mesh-offer", payload: { session_id: sessionId, from: meIdRef.current, to: remoteId, offer: { type: offer.type, sdp: offer.sdp } } });
  }, [getOrCreateChannelPeer]);

  const joinChannelCallPresence = useCallback(async (channelId: string, channelName: string, isHost: boolean, sessionId: string = crypto.randomUUID()) => {
    if (!meIdRef.current) return;
    if (channelCallChRef.current) await disconnectChannelPresence();
    await ensureLocalStream();
    const startedAt = new Date().toISOString();
    const callId = `channel:${sessionId}:${meIdRef.current}`;
    callIdRef.current = callId;
    setActive({
      id: callId,
      peerId: channelId,
      peerName: `#${channelName}`,
      kind: "channel",
      direction: isHost ? "outbound" : "inbound",
      status: "active",
      startedAt,
      endedAt: null,
      muted: false,
      notes: "",
    });
    channelCallSessionIdRef.current = sessionId;
    const ch = supabase.channel(`channel-call:${channelId}`, {
      config: { presence: { key: meIdRef.current } },
    });
    ch.on("broadcast", { event: "who" }, () => {
      ch.send({ type: "broadcast", event: "hello", payload: { user_id: meIdRef.current, session_id: sessionId, fresh: false } });
    });
    ch.on("broadcast", { event: "hello" }, ({ payload }: any) => {
      const uid = payload?.user_id;
      if (!uid || uid === meIdRef.current || payload?.session_id !== sessionId) return;
      if (payload?.fresh === true || (meIdRef.current && meIdRef.current > uid && !channelPeerConnectionsRef.current.has(uid))) {
        void makeChannelOffer(uid, sessionId, ch);
      }
    });
    ch.on("broadcast", { event: "mesh-offer" }, async ({ payload }: any) => {
      if (payload?.session_id !== sessionId || payload?.to !== meIdRef.current || !payload?.from || !payload?.offer) return;
      try {
        const pc = await getOrCreateChannelPeer(payload.from, sessionId, ch);
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const pending = channelPendingIceRef.current.get(payload.from) ?? [];
        for (const c of pending) { try { await pc.addIceCandidate(c); } catch {} }
        channelPendingIceRef.current.delete(payload.from);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await ch.send({ type: "broadcast", event: "mesh-answer", payload: { session_id: sessionId, from: meIdRef.current, to: payload.from, answer: { type: answer.type, sdp: answer.sdp } } });
      } catch (err) {
        console.error("channel offer failed", err);
      }
    });
    ch.on("broadcast", { event: "mesh-answer" }, async ({ payload }: any) => {
      if (payload?.session_id !== sessionId || payload?.to !== meIdRef.current || !payload?.from || !payload?.answer) return;
      const pc = channelPeerConnectionsRef.current.get(payload.from);
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
        const pending = channelPendingIceRef.current.get(payload.from) ?? [];
        for (const c of pending) { try { await pc.addIceCandidate(c); } catch {} }
        channelPendingIceRef.current.delete(payload.from);
      } catch (err) {
        console.error("channel answer failed", err);
      }
    });
    ch.on("broadcast", { event: "mesh-ice" }, async ({ payload }: any) => {
      if (payload?.session_id !== sessionId || payload?.to !== meIdRef.current || !payload?.from || !payload?.candidate) return;
      const pc = channelPeerConnectionsRef.current.get(payload.from);
      if (pc?.remoteDescription) {
        try { await pc.addIceCandidate(payload.candidate); } catch {}
      } else {
        const pending = channelPendingIceRef.current.get(payload.from) ?? [];
        pending.push(payload.candidate);
        channelPendingIceRef.current.set(payload.from, pending);
      }
    });
    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await ch.track({ user_id: meIdRef.current, session_id: sessionId, joined_at: new Date().toISOString() });
        await ch.send({ type: "broadcast", event: "hello", payload: { user_id: meIdRef.current, session_id: sessionId, fresh: true } });
        await ch.send({ type: "broadcast", event: "who", payload: { session_id: sessionId } });
      }
    });
    channelCallChRef.current = ch;
    setChannelCallState({ channelId, channelName, sessionId, isHost });
  }, [disconnectChannelPresence, ensureLocalStream, getOrCreateChannelPeer, makeChannelOffer]);

  const startChannelCall = useCallback(async (channelId: string, channelName: string) => {
    if (active || channelCall || !meIdRef.current) return;
    const sessionId = crypto.randomUUID();
    // Announce in the channel
    try {
      await supabase.from("channel_messages").insert({
        channel_id: channelId,
        author_id: meIdRef.current,
        body: `📞 Started a call — click Join in the header to hop in.`,
        attachments: [{ type: "call_announcement", channelId, host_id: meIdRef.current, session_id: sessionId }] as any,
      } as any);
    } catch {}
    await joinChannelCallPresence(channelId, channelName, true, sessionId);
    playSound("call-connect");
  }, [active, channelCall, joinChannelCallPresence]);

  const joinChannelCall = useCallback(async (channelId: string, channelName: string, sessionId?: string) => {
    if (active || channelCall) return;
    await joinChannelCallPresence(channelId, channelName, false, sessionId);
    playSound("call-connect");
  }, [active, channelCall, joinChannelCallPresence]);

  const leaveChannelCall = useCallback(async () => {
    await disconnectChannelPresence();
    finishCall();
    playSound("call-end");
  }, [disconnectChannelPresence, finishCall]);

  return (
    <Ctx.Provider value={{
      active, history, incoming,
      autoNotesEnabled, setAutoNotesEnabled,
      startCall, acceptIncoming, declineIncoming, endCall, toggleMute, updateNotes,
      remoteAudioRef,
      channelCall, startChannelCall, joinChannelCall, leaveChannelCall,
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
