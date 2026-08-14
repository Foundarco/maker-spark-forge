import { useEffect, useRef, useState } from "react";
import ridgeline from "@/assets/hero-ridgeline-dawn.mp4.asset.json";
import houseBurning from "@/assets/reel-house-burning.mp4.asset.json";
import evacuees from "@/assets/reel-evacuees.mp4.asset.json";
import aftermathClip from "@/assets/reel-aftermath.mp4.asset.json";
import fire from "@/assets/act-fire.jpg";
import aftermath from "@/assets/act-aftermath.jpg";
import california from "@/assets/f-california.jpg";

const SHOT_MS = 4600;

type Shot = { src: string; poster: string; alt: string };

/** The opening reel — cut scenes of what a wildfire actually does. */
const reel: Shot[] = [
  { src: houseBurning.url, poster: fire, alt: "A home engulfed in wildfire flames at night" },
  { src: evacuees.url, poster: aftermath, alt: "A family on a rural road watching a distant smoke column" },
  { src: aftermathClip.url, poster: aftermath, alt: "A burned neighbourhood at dawn, smoking rubble and ash" },
  { src: ridgeline.url, poster: california, alt: "Flight over California ridgelines at dawn" },
];

export function ActOpening() {
  const [shot, setShot] = useState(0);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const id = window.setInterval(() => setShot((s) => (s + 1) % reel.length), SHOT_MS);
    return () => window.clearInterval(id);
  }, []);

  // exactly one video decodes at a time; the next one is warmed just before its cut
  useEffect(() => {
    videos.current.forEach((el, i) => {
      if (!el) return;
      if (i === shot) {
        el.currentTime = 0;
        void el.play().catch(() => {});
      } else {
        el.pause();
        if (i === (shot + 1) % reel.length && el.preload !== "auto") el.preload = "auto";
      }
    });
  }, [shot]);

  return (
    <section
      aria-label="Mission 01 — see the fire sooner"
      className="relative isolate h-svh overflow-hidden bg-black"
    >
      {reel.map((s, i) => (
        <div
          key={i}
          className="reel-shot"
          style={{ opacity: i === shot ? 1 : 0, visibility: i === shot ? "visible" : "hidden" }}
        >
          <video
            ref={(el) => {
              videos.current[i] = el;
            }}
            className="reel-media"
            muted
            loop
            playsInline
            preload={i === 0 ? "auto" : "none"}
            poster={s.poster}
            aria-label={s.alt}
          >
            <source src={s.src} type="video/mp4" />
          </video>
        </div>
      ))}

      <div className="reel-grade" aria-hidden />
      <div className="pointer-events-none absolute inset-0 film-grain" aria-hidden />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-20 sm:px-8 sm:pb-24">
        <p className="reel-line" style={{ animationDelay: "0.4s" }}>
          This is what it costs.
        </p>
        <p className="reel-line" style={{ animationDelay: "2.4s" }}>
          It starts somewhere nobody is watching.
        </p>
        <h1 className="reel-title display-cond text-[clamp(3.2rem,10vw,8rem)] leading-[0.88] text-ink">
          See the fire sooner.
        </h1>
        <div className="reel-foot">
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-[var(--signal)]">
            Mission 01 · Wildfire · In development
          </span>
          <span className="reel-cue" aria-hidden />
        </div>
      </div>
    </section>
  );
}
