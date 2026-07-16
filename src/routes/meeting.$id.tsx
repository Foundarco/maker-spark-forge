import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, ScreenShare, ScreenShareOff,
  PhoneOff, FileText, Copy, Check, Users, MessageSquare, Send, Maximize2, X,
} from "lucide-react";

type MeetingSearch = { t?: string };

export const Route = createFileRoute("/meeting/$id")({
  head: () => ({ meta: [{ title: "Meeting Room — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (s: Record<string, unknown>): MeetingSearch => ({ t: typeof s.t === "string" ? s.t : undefined }),
  component: MeetingRoom,
});

type Meeting = { id: string; title: string; description: string | null; host_id: string; starts_at: string; ends_at: string };
type Profile = { id: string; full_name: string | null; email: string | null };
type ChatMsg = { id: string; from: string; fromName: string; text: string; t: number };

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

type Peer = { pc: RTCPeerConnection; name: string; streams: Record<string, MediaStream> };

// Apply the HQ dark/light theme on the meeting route so it matches the rest of the app.
function useHQThemeSync() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const apply = () => {
      const stored = window.localStorage.getItem("hq-theme") ?? "dark";
      const resolved =
        stored === "system"
          ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
          : stored;
      const root = document.documentElement;
      if (resolved === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
    };
    apply();
    const mm = window.matchMedia("(prefers-color-scheme: dark)");
    mm.addEventListener?.("change", apply);
    return () => mm.removeEventListener?.("change", apply);
  }, []);
}

function MeetingRoom() {
  useHQThemeSync();
  const { id } = Route.useParams();
  const { t: inviteToken } = useSearch({ from: "/meeting/$id" }) as MeetingSearch;
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [me, setMe] = useState<{ id: string; name: string; external: boolean } | null>(null);
  const [guestNamePrompt, setGuestNamePrompt] = useState<{ email: string | null } | null>(null);
  const [peers, setPeers] = useState<Record<string, Peer>>({});
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<{ t: number; text: string; speaker: string }[]>([]);
  const [interim, setInterim] = useState("");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidePanel, setSidePanel] = useState<"chat" | "transcript" | null>("chat");
  const [enlarged, setEnlarged] = useState<{ stream: MediaStream; label: string } | null>(null);
  const [, forceTick] = useState(0);
  const [speakingKeys, setSpeakingKeys] = useState<Record<string, boolean>>({});
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [ending, setEnding] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, Peer>>({});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const recognitionRef = useRef<any>(null);
  const meRef = useRef<{ id: string; name: string; external: boolean } | null>(null);
  const noteSavedRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analysersRef = useRef<Map<string, { analyser: AnalyserNode; source: MediaStreamAudioSourceNode }>>(new Map());
  const startedAtRef = useRef<number>(Date.now());

  const updatePeer = (uid: string, updater: (p: Peer | undefined) => Peer | undefined) => {
    const next = updater(peersRef.current[uid]);
    if (!next) {
      const { [uid]: _, ...rest } = peersRef.current;
      peersRef.current = rest;
    } else {
      peersRef.current = { ...peersRef.current, [uid]: next };
    }
    setPeers({ ...peersRef.current });
  };

  const sendOffer = useCallback(async (remoteId: string, pc: RTCPeerConnection) => {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    channelRef.current?.send({
      type: "broadcast", event: "offer",
      payload: { to: remoteId, from: meRef.current?.id, fromName: meRef.current?.name, sdp: offer },
    });
  }, []);

  const createPeer = useCallback((remoteId: string, remoteName: string, initiator: boolean) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Add all local tracks (camera + optional screen)
    localStreamRef.current?.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));
    screenStreamRef.current?.getTracks().forEach((t) => pc.addTrack(t, screenStreamRef.current!));

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      if (!stream) return;
      updatePeer(remoteId, (p) => {
        const base = p ?? { pc, name: remoteName, streams: {} };
        if (!base.streams[stream.id]) {
          base.streams = { ...base.streams, [stream.id]: stream };
          stream.onremovetrack = () => {
            if (stream.getTracks().length === 0) {
              updatePeer(remoteId, (pp) => {
                if (!pp) return pp;
                const { [stream.id]: _drop, ...rest } = pp.streams;
                return { ...pp, streams: rest };
              });
            }
          };
        }
        return { ...base };
      });
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) channelRef.current?.send({
        type: "broadcast", event: "ice",
        payload: { to: remoteId, from: meRef.current?.id, candidate: e.candidate },
      });
    };

    updatePeer(remoteId, () => ({ pc, name: remoteName, streams: {} }));
    if (initiator) void sendOffer(remoteId, pc);
    return pc;
  }, [sendOffer]);

  const cleanupAll = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    Object.values(peersRef.current).forEach((p) => p.pc.close());
    peersRef.current = {};
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    channelRef.current = null;
  }, []);

  const saveMeetingNote = useCallback(async (options?: { hostEnded?: boolean }) => {
    if (noteSavedRef.current) return;
    if (!meRef.current || meRef.current.external) return;
    const { data: existing } = await supabase.from("meeting_notes").select("id").eq("meeting_id", id).limit(1);
    if (existing && existing.length > 0) { noteSavedRef.current = true; return; }
    const attendeeNames = Array.from(new Set([
      meRef.current.name,
      ...Object.values(peersRef.current).map((p) => p.name),
    ]));
    const durationMs = Date.now() - startedAtRef.current;
    const mins = Math.floor(durationMs / 60000);
    const secs = Math.floor((durationMs % 60000) / 1000);
    const durationStr = mins >= 1 ? `${mins} min ${secs}s` : `${secs}s`;
    // Extract shared links from chat
    const chatMsgs = chat.filter((m) => m.text.trim());
    const links: string[] = [];
    for (const m of chatMsgs) {
      const found = m.text.match(/https?:\/\/[^\s]+/g);
      if (found) links.push(...found);
    }
    const uniqueLinks = Array.from(new Set(links));
    const md = [
      `# ${meeting?.title ?? "Meeting"} — Notes`,
      "",
      `**Date:** ${new Date().toLocaleString([], { dateStyle: "full", timeStyle: "short" })}`,
      `**Duration:** ${durationStr}`,
      `**Ended by:** ${meRef.current.name}${options?.hostEnded ? " (host ended for everyone)" : ""}`,
      "",
      "## Attendees",
      ...attendeeNames.map((n) => `- ${n}`),
      "",
      "## Summary",
      transcript.length
        ? "Auto-generated from live transcript. Review and edit as needed."
        : "_No live transcript was captured. Add a summary here._",
      "",
      transcript.length ? "## Transcript" : "",
      ...(transcript.length ? transcript.map((t) => `- **${t.speaker}** _(${new Date(t.t).toLocaleTimeString()})_: ${t.text}`) : []),
      "",
      chatMsgs.length ? "## Chat Highlights" : "",
      ...(chatMsgs.length ? chatMsgs.slice(-20).map((m) => `- **${m.fromName}:** ${m.text}`) : []),
      "",
      uniqueLinks.length ? "## Links Shared" : "",
      ...uniqueLinks.map((l) => `- ${l}`),
      "",
      "## Action Items",
      "- _Add action items and owners here._",
    ].filter((line, i, arr) => !(line === "" && arr[i - 1] === "")).join("\n");
    const plain = md.replace(/[#*_]/g, "");
    await supabase.from("meeting_notes").insert({
      meeting_id: id,
      author_id: meRef.current.id,
      title: `${meeting?.title ?? "Meeting"} — Notes`,
      body: plain,
      content_md: md,
      meeting_date: new Date().toISOString(),
      tags: transcript.length ? ["transcript", "auto"] : ["auto"],
      attendees: attendeeNames,
    } as any);
    noteSavedRef.current = true;
  }, [id, transcript, meeting?.title, chat]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      let meData: { id: string; name: string; external: boolean } | null = null;

      if (u.user) {
        const { data: p } = await supabase.from("profiles").select("id, full_name, email").eq("id", u.user.id).maybeSingle();
        const name = (p as Profile | null)?.full_name || (p as Profile | null)?.email || "Teammate";
        meData = { id: u.user.id, name, external: false };
      } else if (inviteToken) {
        const { data: invRows } = await supabase.rpc("get_meeting_invite_by_token", {
          _token: inviteToken,
          _meeting_id: id,
        });
        const inv = Array.isArray(invRows) ? invRows[0] : null;
        if (!inv) { setError("This guest link is invalid or has expired."); return; }
        const cachedName = typeof window !== "undefined" ? window.sessionStorage.getItem(`meeting-guest-${id}`) : null;
        const name = inv.name || cachedName || null;
        if (!name) { setGuestNamePrompt({ email: inv.email }); return; }
        meData = { id: `guest-${inv.id}`, name, external: true };
        await supabase.rpc("mark_meeting_invite_joined", { _token: inviteToken, _name: name });
      } else {
        // Open link — anyone with the URL can join by giving a name.
        const cachedName = typeof window !== "undefined" ? window.sessionStorage.getItem(`meeting-guest-${id}`) : null;
        if (!cachedName) { setGuestNamePrompt({ email: null }); return; }
        const guestId = window.sessionStorage.getItem(`meeting-guestid-${id}`) ||
          `guest-${Math.random().toString(36).slice(2, 10)}`;
        window.sessionStorage.setItem(`meeting-guestid-${id}`, guestId);
        meData = { id: guestId, name: cachedName, external: true };
      }

      meRef.current = meData;
      setMe(meData);

      const { data: m } = await supabase.from("meetings").select("*").eq("id", id).maybeSingle();
      if (m) setMeeting(m as Meeting);

      if (!meData.external) {
        await supabase.from("meeting_participants").upsert({ meeting_id: id, user_id: meData.id, rsvp: "yes" }, { onConflict: "meeting_id,user_id" });
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }
        localStreamRef.current = stream;
        forceTick((n) => n + 1);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err: any) {
        setError("Camera/mic access denied. " + err.message);
        return;
      }

      const ch = supabase.channel(`meeting:${id}`, { config: { presence: { key: meData.id } } });
      channelRef.current = ch;

      ch.on("broadcast", { event: "offer" }, async ({ payload }) => {
        if (payload.to !== meRef.current?.id) return;
        let peer = peersRef.current[payload.from];
        if (!peer) { createPeer(payload.from, payload.fromName ?? "Guest", false); peer = peersRef.current[payload.from]; }
        await peer.pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await peer.pc.createAnswer();
        await peer.pc.setLocalDescription(answer);
        ch.send({ type: "broadcast", event: "answer", payload: { to: payload.from, from: meRef.current?.id, sdp: answer } });
      });
      ch.on("broadcast", { event: "answer" }, async ({ payload }) => {
        if (payload.to !== meRef.current?.id) return;
        const peer = peersRef.current[payload.from];
        if (peer) await peer.pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      });
      ch.on("broadcast", { event: "ice" }, async ({ payload }) => {
        if (payload.to !== meRef.current?.id) return;
        const peer = peersRef.current[payload.from];
        if (peer && payload.candidate) { try { await peer.pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch {} }
      });
      ch.on("broadcast", { event: "leave" }, ({ payload }) => {
        const peer = peersRef.current[payload.from];
        if (peer) { peer.pc.close(); updatePeer(payload.from, () => undefined); }
      });
      ch.on("broadcast", { event: "transcript" }, ({ payload }) => {
        if (payload.from === meRef.current?.id) return;
        setTranscript((prev) => [...prev, { t: payload.t, text: payload.text, speaker: payload.speaker }]);
      });
      ch.on("broadcast", { event: "chat" }, ({ payload }) => {
        if (payload.from === meRef.current?.id) return;
        setChat((prev) => [...prev, payload as ChatMsg]);
      });
      ch.on("presence", { event: "sync" }, () => {
        const state = ch.presenceState() as Record<string, Array<{ name?: string }>>;
        Object.keys(state).forEach((uid) => {
          if (uid === meRef.current?.id) return;
          if (peersRef.current[uid]) return;
          const initiate = (meRef.current!.id) < uid;
          const name = state[uid]?.[0]?.name ?? "Guest";
          if (initiate) createPeer(uid, name, true);
        });
      });

      await ch.subscribe(async (status) => {
        if (status === "SUBSCRIBED") await ch.track({ name: meData!.name });
      });
    })();

    return () => {
      mounted = false;
      channelRef.current?.send({ type: "broadcast", event: "leave", payload: { from: meRef.current?.id } });
      void saveMeetingNote();
      cleanupAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, guestNamePrompt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.length]);

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  };
  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOn(track.enabled); }
  };

  const renegotiateAll = async () => {
    for (const [uid, p] of Object.entries(peersRef.current)) {
      // Only initiators re-offer to avoid glare; the other side already receives new track on remote offer.
      if ((meRef.current!.id) < uid) {
        try { await sendOffer(uid, p.pc); } catch {}
      }
    }
  };

  const toggleShare = async () => {
    if (sharing) {
      const s = screenStreamRef.current;
      if (s) {
        s.getTracks().forEach((t) => {
          Object.values(peersRef.current).forEach((p) => {
            const sender = p.pc.getSenders().find((sn) => sn.track === t);
            if (sender) try { p.pc.removeTrack(sender); } catch {}
          });
          t.stop();
        });
      }
      screenStreamRef.current = null;
      setSharing(false);
      await renegotiateAll();
      return;
    }
    try {
      const disp = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenStreamRef.current = disp;
      disp.getTracks().forEach((t) => {
        Object.values(peersRef.current).forEach((p) => { p.pc.addTrack(t, disp); });
      });
      disp.getVideoTracks()[0].onended = () => { void toggleShare(); };
      setSharing(true);
      await renegotiateAll();
    } catch {}
  };

  const toggleTranscribe = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Live transcription is not supported in this browser. Try Chrome or Edge."); return; }
    if (transcribing) {
      try { recognitionRef.current?.stop(); } catch {}
      recognitionRef.current = null;
      setTranscribing(false); setInterim(""); return;
    }
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
    rec.onresult = (event: any) => {
      let interimStr = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const text = res[0].transcript.trim();
        if (res.isFinal && text) {
          const entry = { t: Date.now(), text, speaker: meRef.current?.name ?? "Me" };
          setTranscript((prev) => [...prev, entry]);
          channelRef.current?.send({ type: "broadcast", event: "transcript", payload: { ...entry, from: meRef.current?.id } });
        } else { interimStr += text + " "; }
      }
      setInterim(interimStr);
    };
    rec.onerror = () => {};
    rec.onend = () => { if (recognitionRef.current === rec) { try { rec.start(); } catch {} } };
    recognitionRef.current = rec;
    try { rec.start(); setTranscribing(true); } catch (e: any) { alert(e.message); }
  };

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatDraft.trim();
    if (!text || !meRef.current) return;
    const msg: ChatMsg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      from: meRef.current.id,
      fromName: meRef.current.name,
      text,
      t: Date.now(),
    };
    setChat((prev) => [...prev, msg]);
    channelRef.current?.send({ type: "broadcast", event: "chat", payload: msg });
    setChatDraft("");
  };

  const leave = async () => {
    await saveMeetingNote();
    channelRef.current?.send({ type: "broadcast", event: "leave", payload: { from: meRef.current?.id } });
    cleanupAll();
    if (meRef.current?.external) navigate({ to: "/" });
    else navigate({ to: "/meetings" });
  };

  const copyLink = async () => {
    const url = new URL(window.location.href);
    url.search = ""; // share the open link, without any guest token
    // Preview hosts (lovableproject.com, id-preview--*.lovable.app) require Lovable auth.
    // Swap to the public custom domain so guests can join without hitting the auth gate.
    const host = url.hostname.toLowerCase();
    const isPublicHost =
      host === "hq.clovrlab.com" ||
      host === "clovrlab.com" ||
      host === "www.clovrlab.com";
    if (!isPublicHost) {
      url.protocol = "https:";
      url.hostname = "hq.clovrlab.com";
      url.port = "";
    }
    await navigator.clipboard.writeText(url.toString());
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  // Build the flat tile list: my camera, my screen (if any), then each remote stream.
  const tiles: { key: string; label: string; stream: MediaStream | null; muted: boolean; isMe: boolean; isScreen: boolean }[] = [];
  if (localStreamRef.current) {
    tiles.push({ key: "me-cam", label: `${me?.name ?? "You"} (you)`, stream: localStreamRef.current, muted: true, isMe: true, isScreen: false });
  }
  if (screenStreamRef.current) {
    tiles.push({ key: "me-screen", label: `${me?.name ?? "You"} · screen`, stream: screenStreamRef.current, muted: true, isMe: true, isScreen: true });
  }
  Object.entries(peers).forEach(([uid, p]) => {
    const streams = Object.values(p.streams);
    if (streams.length === 0) {
      tiles.push({ key: uid, label: p.name, stream: null, muted: false, isMe: false, isScreen: false });
    } else {
      streams.forEach((s, i) => {
        const isScreen = streams.length > 1 && i > 0;
        tiles.push({
          key: `${uid}-${s.id}`,
          label: isScreen ? `${p.name} · screen` : p.name,
          stream: s,
          muted: false,
          isMe: false,
          isScreen,
        });
      });
    }
  });

  const gridCols = tiles.length >= 4 ? "grid-cols-2 lg:grid-cols-3" : tiles.length >= 2 ? "grid-cols-2" : "grid-cols-1";

  if (guestNamePrompt) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const name = String(fd.get("name") ?? "").trim();
            if (!name) return;
            window.sessionStorage.setItem(`meeting-guest-${id}`, name);
            setGuestNamePrompt(null);
          }}
          className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl"
        >
          <h1 className="text-lg font-semibold">Join the meeting</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {guestNamePrompt.email ? `Signed in as guest: ${guestNamePrompt.email}` : "Enter your name to join."}
          </p>
          <input name="name" required autoFocus placeholder="Your name" className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <button type="submit" className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Continue</button>
        </form>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-lg font-semibold">{error}</p>
        <Link to="/" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Home</Link>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">{meeting?.title ?? "Meeting"}</h1>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" /> {Object.keys(peers).length + 1} in room · {me?.name}{me?.external ? " (guest)" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyLink} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Invite link
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 flex-col p-3">
          <div className={`grid flex-1 gap-3 ${gridCols}`}>
            {tiles.map((tile) => (
              <Tile
                key={tile.key}
                label={tile.label}
                stream={tile.stream}
                muted={tile.muted}
                showAvatar={tile.isMe && !camOn && !tile.isScreen}
                avatarLetter={me?.name?.[0]?.toUpperCase() ?? "?"}
                onEnlarge={tile.stream ? () => setEnlarged({ stream: tile.stream!, label: tile.label }) : undefined}
                videoRef={tile.key === "me-cam" ? localVideoRef : undefined}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <ControlBtn active={micOn} onClick={toggleMic} label={micOn ? "Mute" : "Unmute"} icon={micOn ? Mic : MicOff} danger={!micOn} />
            <ControlBtn active={camOn} onClick={toggleCam} label={camOn ? "Stop video" : "Start video"} icon={camOn ? VideoIcon : VideoOff} danger={!camOn} />
            <ControlBtn active={sharing} onClick={toggleShare} label={sharing ? "Stop share" : "Share screen"} icon={sharing ? ScreenShareOff : ScreenShare} />
            <ControlBtn active={transcribing} onClick={toggleTranscribe} label={transcribing ? "Stop transcribing" : "Live transcribe"} icon={FileText} />
            <ControlBtn active={sidePanel === "chat"} onClick={() => setSidePanel(sidePanel === "chat" ? null : "chat")} label="Chat" icon={MessageSquare} />
            <button onClick={leave} className="ml-2 flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90">
              <PhoneOff className="h-4 w-4" /> Leave
            </button>
          </div>
        </div>

        {sidePanel && (
          <aside className="hidden w-80 flex-col border-l border-border md:flex">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 text-sm font-semibold">
              <div className="flex gap-3">
                <button
                  onClick={() => setSidePanel("chat")}
                  className={sidePanel === "chat" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
                >Chat</button>
                <button
                  onClick={() => setSidePanel("transcript")}
                  className={sidePanel === "transcript" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
                >Transcript</button>
              </div>
              <button onClick={() => setSidePanel(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {sidePanel === "chat" ? (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-3 text-sm space-y-3">
                  {chat.length === 0 && (
                    <p className="text-xs text-muted-foreground">Send messages, links, or notes to everyone in the meeting.</p>
                  )}
                  {chat.map((m) => (
                    <div key={m.id}>
                      <p className="text-[11px] text-muted-foreground">
                        {m.fromName} · {new Date(m.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p className="whitespace-pre-wrap break-words">
                        {linkify(m.text)}
                      </p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={sendChat} className="flex items-center gap-2 border-t border-border p-3">
                  <input
                    value={chatDraft}
                    onChange={(e) => setChatDraft(e.target.value)}
                    placeholder="Message everyone"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button type="submit" className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90">
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-3 text-sm">
                {transcript.length === 0 && !interim && (
                  <p className="text-xs text-muted-foreground">
                    {transcribing ? "Listening…" : "Click Live transcribe to capture your mic. A meeting note is auto-created when you leave."}
                  </p>
                )}
                {transcript.map((t, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-xs text-muted-foreground">{t.speaker} · {new Date(t.t).toLocaleTimeString()}</p>
                    <p>{t.text}</p>
                  </div>
                ))}
                {interim && <p className="italic text-muted-foreground">{interim}</p>}
              </div>
            )}
          </aside>
        )}
      </div>

      {enlarged && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setEnlarged(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setEnlarged(null); }}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute left-6 top-6 rounded bg-black/60 px-3 py-1 text-sm text-white">{enlarged.label}</div>
          <EnlargedVideo stream={enlarged.stream} />
        </div>
      )}
    </div>
  );
}

function Tile({
  label, stream, muted, showAvatar, avatarLetter, onEnlarge, videoRef,
}: {
  label: string;
  stream: MediaStream | null;
  muted: boolean;
  showAvatar: boolean;
  avatarLetter: string;
  onEnlarge?: () => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}) {
  const localRef = useRef<HTMLVideoElement>(null);
  const ref = videoRef ?? localRef;
  useEffect(() => {
    if (ref.current && stream && ref.current.srcObject !== stream) {
      ref.current.srcObject = stream;
    }
  }, [stream, ref]);
  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-black ${onEnlarge ? "cursor-zoom-in" : ""}`}
      onClick={onEnlarge}
    >
      <video ref={ref} autoPlay muted={muted} playsInline className="h-full w-full object-cover" />
      {showAvatar && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-semibold">
            {avatarLetter}
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">{label}</div>
      {onEnlarge && (
        <div className="absolute right-2 top-2 hidden rounded bg-black/60 p-1.5 text-white group-hover:block">
          <Maximize2 className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}

function EnlargedVideo({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (ref.current) ref.current.srcObject = stream; }, [stream]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      className="max-h-full max-w-full rounded-xl object-contain"
      onClick={(e) => e.stopPropagation()}
    />
  );
}

function ControlBtn({ active, onClick, label, icon: Icon, danger }: { active: boolean; onClick: () => void; label: string; icon: any; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
        danger ? "bg-destructive text-destructive-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <a key={i} href={p} target="_blank" rel="noreferrer" className="text-primary underline break-all">{p}</a>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
