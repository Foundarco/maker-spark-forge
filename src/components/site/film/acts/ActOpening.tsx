import { useEffect, useRef, useState } from "react";
import ridgeline from "@/assets/hero-ridgeline-dawn.mp4.asset.json";
import fire from "@/assets/act-fire.jpg";
import aftermath from "@/assets/act-aftermath.jpg";
import install from "@/assets/act-install.jpg";
import uavStill from "@/assets/j-uav.jpg";
import california from "@/assets/f-california.jpg";

const SHOT_MS = 3400;

type Shot = { kind: "video"; src: string; poster: string; alt: string } | { kind: "image"; src: string; alt: string };

/** The opening reel. Cut, don't dissolve — this is a film title sequence. */
const reel: Shot[] = [
  { kind: "image", src: fire, alt: "A wildfire burning along a forested ridge at dusk" },
  { kind: "image", src: aftermath, alt: "A person standing in the ashes of a burned structure" },
  { kind: "image", src: uavStill, alt: "An uncrewed aircraft in flight above mountain country" },
  { kind: "video", src: ridgeline.url, poster: california, alt: "Flight over California ridgelines at dawn" },
  { kind: "image", src: install, alt: "A field engineer installing an environmental sensor on a tree" },
];

export function ActOpening() {
  const [shot, setShot] = useState(0);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setShot((s) => (s + 1) % reel.length), SHOT_MS);
    return () => window.clearInterval(id);
  }, []);

  // exactly one video, and it only decodes while its own shot is on screen
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const active = reel[shot]?.kind === "video";
    if (active) void el.play().catch(() => {});
    else {
      el.pause();
      el.currentTime = 0;
    }
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
          {s.kind === "video" ? (
            <video
              ref={video}
              className="reel-media"
              muted
              loop
              playsInline
              preload="none"
              poster={s.poster}
              aria-label={s.alt}
            >
              <source src={s.src} type="video/mp4" />
            </video>
          ) : (
            <img
              src={s.src}
              alt={i === 0 ? s.alt : ""}
              aria-hidden={i !== 0}
              className="reel-media"
              width={1920}
              height={1080}
              {...(i === 0 ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
            />
          )}
        </div>
      ))}

      <div className="reel-grade" aria-hidden />
      <div className="pointer-events-none absolute inset-0 film-grain" aria-hidden />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-20 sm:px-8 sm:pb-24">
        <p className="reel-line" style={{ animationDelay: "0.4s" }}>
          Something starts.
        </p>
        <p className="reel-line" style={{ animationDelay: "2.4s" }}>
          Somewhere nobody is watching.
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
