import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, ScreenShare, ScreenShareOff,
  PhoneOff, Users, FileText, Copy, Check,
} from "lucide-react";

export const Route = createFileRoute("/meeting/$id")({
  head: () => ({ meta: [{ title: "Meeting Room — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: MeetingRoom,
});

type Meeting = { id: string; title: string; description: string | null; host_id: string; starts_at: string; ends_at: string };
type Profile = { id: string; full_name: string | null; email: string | null };

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

type Peer = {
  pc: RTCPeerConnection;
  stream: MediaStream;
  name: string;
};

function MeetingRoom() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [me, setMe] = useState<{ id: string; name: string } | null>(null);
  const [peers, setPeers] = useState<Record<string, Peer>>({});
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<{ t: number; text: string; speaker: string }[]>([]);
  const [interim, setInterim] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const camTrackRef = useRef<MediaStreamTrack | null>(null);
  const peersRef = useRef<Record<string, Peer>>({});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const recognitionRef = useRef<any>(null);
  const meRef = useRef<{ id: string; name: string } | null>(null);

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

  const createPeer = useCallback((remoteId: string, remoteName: string, initiator: boolean) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const remoteStream = new MediaStream();

    localStreamRef.current?.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));

    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach((t) => {
        if (!remoteStream.getTracks().find((x) => x.id === t.id)) remoteStream.addTrack(t);
      });
      updatePeer(remoteId, (p) => (p ? { ...p, stream: remoteStream } : { pc, stream: remoteStream, name: remoteName }));
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        channelRef.current?.send({
          type: "broadcast",
          event: "ice",
          payload: { to: remoteId, from: meRef.current?.id, candidate: e.candidate },
        });
      }
    };

    updatePeer(remoteId, () => ({ pc, stream: remoteStream, name: remoteName }));

    if (initiator) {
      (async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        channelRef.current?.send({
          type: "broadcast",
          event: "offer",
          payload: { to: remoteId, from: meRef.current?.id, fromName: meRef.current?.name, sdp: offer },
        });
      })();
    }

    return pc;
  }, []);

  const cleanupAll = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    Object.values(peersRef.current).forEach((p) => p.pc.close());
    peersRef.current = {};
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenTrackRef.current?.stop();
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    channelRef.current = null;
  }, []);

  // Save transcript as meeting note on leave
  const saveTranscriptNote = useCallback(async () => {
    if (!meRef.current || transcript.length === 0) return;
    const body = transcript.map((t) => `[${new Date(t.t).toLocaleTimeString()}] ${t.speaker}: ${t.text}`).join("\n");
    await supabase.from("meeting_notes").insert({
      meeting_id: id,
      author_id: meRef.current.id,
      title: `Transcript — ${meeting?.title ?? "Meeting"}`,
      body,
      meeting_date: new Date().toISOString(),
      tags: ["transcript", "auto"],
      attendees: [],
    });
  }, [id, transcript, meeting?.title]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { navigate({ to: "/hq-login" }); return; }
      const { data: p } = await supabase.from("profiles").select("id, full_name, email").eq("id", u.user.id).maybeSingle();
      const name = (p as Profile | null)?.full_name || (p as Profile | null)?.email || "Guest";
      const meData = { id: u.user.id, name };
      meRef.current = meData;
      setMe(meData);

      const { data: m } = await supabase.from("meetings").select("*").eq("id", id).maybeSingle();
      if (!m) { setError("Meeting not found or you don't have access."); return; }
      setMeeting(m as Meeting);

      // record participation
      await supabase.from("meeting_participants").upsert({ meeting_id: id, user_id: u.user.id, rsvp: "yes" }, { onConflict: "meeting_id,user_id" });

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }
        localStreamRef.current = stream;
        camTrackRef.current = stream.getVideoTracks()[0] ?? null;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err: any) {
        setError("Camera/mic access denied. " + err.message);
        return;
      }

      // Signaling channel scoped to the meeting id
      const ch = supabase.channel(`meeting:${id}`, { config: { presence: { key: u.user.id } } });
      channelRef.current = ch;

      ch.on("broadcast", { event: "offer" }, async ({ payload }) => {
        if (payload.to !== meRef.current?.id) return;
        let peer = peersRef.current[payload.from];
        if (!peer) {
          createPeer(payload.from, payload.fromName ?? "Guest", false);
          peer = peersRef.current[payload.from];
        }
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
        if (peer && payload.candidate) {
          try { await peer.pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch {}
        }
      });

      ch.on("broadcast", { event: "leave" }, ({ payload }) => {
        const peer = peersRef.current[payload.from];
        if (peer) { peer.pc.close(); updatePeer(payload.from, () => undefined); }
      });

      ch.on("broadcast", { event: "transcript" }, ({ payload }) => {
        if (payload.from === meRef.current?.id) return;
        setTranscript((prev) => [...prev, { t: payload.t, text: payload.text, speaker: payload.speaker }]);
      });

      ch.on("presence", { event: "sync" }, () => {
        const state = ch.presenceState() as Record<string, Array<{ name?: string }>>;
        Object.keys(state).forEach((uid) => {
          if (uid === meRef.current?.id) return;
          if (peersRef.current[uid]) return;
          // Deterministic initiator: lower id initiates
          const initiate = (meRef.current!.id) < uid;
          const name = state[uid]?.[0]?.name ?? "Guest";
          if (initiate) createPeer(uid, name, true);
        });
      });

      await ch.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await ch.track({ name: meData.name });
        }
      });
    })();

    return () => {
      mounted = false;
      channelRef.current?.send({ type: "broadcast", event: "leave", payload: { from: meRef.current?.id } });
      cleanupAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  };

  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOn(track.enabled); }
  };

  const toggleShare = async () => {
    if (sharing) {
      screenTrackRef.current?.stop();
      screenTrackRef.current = null;
      const cam = camTrackRef.current;
      if (cam) {
        Object.values(peersRef.current).forEach((p) => {
          const sender = p.pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(cam);
        });
        localStreamRef.current?.getVideoTracks().forEach((t) => localStreamRef.current!.removeTrack(t));
        localStreamRef.current?.addTrack(cam);
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      }
      setSharing(false);
      return;
    }
    try {
      const disp = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = disp.getVideoTracks()[0];
      screenTrackRef.current = track;
      Object.values(peersRef.current).forEach((p) => {
        const sender = p.pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(track);
      });
      // Show locally
      const preview = new MediaStream([track, ...(localStreamRef.current?.getAudioTracks() ?? [])]);
      if (localVideoRef.current) localVideoRef.current.srcObject = preview;
      track.onended = () => toggleShare();
      setSharing(true);
    } catch (e) {
      // user cancelled
    }
  };

  const toggleTranscribe = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Live transcription is not supported in this browser. Try Chrome or Edge."); return; }
    if (transcribing) {
      try { recognitionRef.current?.stop(); } catch {}
      recognitionRef.current = null;
      setTranscribing(false);
      setInterim("");
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (event: any) => {
      let interimStr = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const text = res[0].transcript.trim();
        if (res.isFinal && text) {
          const entry = { t: Date.now(), text, speaker: meRef.current?.name ?? "Me" };
          setTranscript((prev) => [...prev, entry]);
          channelRef.current?.send({ type: "broadcast", event: "transcript", payload: { ...entry, from: meRef.current?.id } });
        } else {
          interimStr += text + " ";
        }
      }
      setInterim(interimStr);
    };
    rec.onerror = (e: any) => { console.warn("SR error", e.error); };
    rec.onend = () => { if (recognitionRef.current === rec) { try { rec.start(); } catch {} } };
    recognitionRef.current = rec;
    try { rec.start(); setTranscribing(true); } catch (e: any) { alert(e.message); }
  };

  const leave = async () => {
    await saveTranscriptNote();
    channelRef.current?.send({ type: "broadcast", event: "leave", payload: { from: meRef.current?.id } });
    cleanupAll();
    navigate({ to: "/meetings" });
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const remotePeers = Object.entries(peers);
  const gridCols = remotePeers.length >= 3 ? "grid-cols-2" : remotePeers.length >= 1 ? "grid-cols-2" : "grid-cols-1";

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-lg font-semibold">{error}</p>
        <Link to="/meetings" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Back to meetings</Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">{meeting?.title ?? "Meeting"}</h1>
          <p className="text-xs text-muted-foreground">{Object.keys(peers).length + 1} in room · {me?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyLink} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Invite link
          </button>
          <button onClick={() => setShowNotes((s) => !s)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">
            <FileText className="h-3.5 w-3.5" /> {showNotes ? "Hide" : "Show"} transcript
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 flex-col p-3">
          <div className={`grid flex-1 gap-3 ${gridCols}`}>
            <div className="relative overflow-hidden rounded-xl bg-black">
              <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
              <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                {me?.name} (you){sharing ? " · sharing" : ""}
              </div>
              {!camOn && !sharing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-semibold">
                    {me?.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                </div>
              )}
            </div>
            {remotePeers.map(([uid, p]) => (
              <RemoteTile key={uid} peer={p} />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <ControlBtn active={micOn} onClick={toggleMic} label={micOn ? "Mute" : "Unmute"} icon={micOn ? Mic : MicOff} danger={!micOn} />
            <ControlBtn active={camOn} onClick={toggleCam} label={camOn ? "Stop video" : "Start video"} icon={camOn ? VideoIcon : VideoOff} danger={!camOn} />
            <ControlBtn active={sharing} onClick={toggleShare} label={sharing ? "Stop share" : "Share screen"} icon={sharing ? ScreenShareOff : ScreenShare} />
            <ControlBtn active={transcribing} onClick={toggleTranscribe} label={transcribing ? "Stop transcribing" : "Live transcribe"} icon={FileText} />
            <button onClick={leave} className="ml-2 flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90">
              <PhoneOff className="h-4 w-4" /> Leave
            </button>
          </div>
        </div>

        {showNotes && (
          <aside className="hidden w-80 flex-col border-l border-border md:flex">
            <div className="border-b border-border px-4 py-3 text-sm font-semibold">Live transcript</div>
            <div className="flex-1 overflow-y-auto px-4 py-3 text-sm">
              {transcript.length === 0 && !interim && (
                <p className="text-xs text-muted-foreground">
                  {transcribing ? "Listening…" : "Click Live transcribe to start capturing your mic. Transcript saves to Meeting Notes on leave."}
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
          </aside>
        )}
      </div>
    </div>
  );
}

function RemoteTile({ peer }: { peer: Peer }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (ref.current) ref.current.srcObject = peer.stream; }, [peer.stream]);
  return (
    <div className="relative overflow-hidden rounded-xl bg-black">
      <video ref={ref} autoPlay playsInline className="h-full w-full object-cover" />
      <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">{peer.name}</div>
    </div>
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

// unused helper kept for future presence UI
export const _users = Users;
