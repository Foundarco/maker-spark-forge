import { useEffect, useRef, useState } from "react";
import hood1 from "@/assets/reel-neighborhood-1.mp4.asset.json";
import hood2 from "@/assets/reel-neighborhood-2.mp4.asset.json";
import aftermathClip from "@/assets/reel-aftermath.mp4.asset.json";
import aftermath from "@/assets/act-aftermath.jpg";

const SHOT_MS = 4600;

type Shot = { src: string; alt: string };

/** The opening reel — a neighbourhood after the fire, then black, then the words. */
const reel: Shot[] = [
  { src: hood1.url, alt: "Aerial view of a burned neighbourhood, homes reduced to smouldering foundations" },
  { src: hood2.url, alt: "A destroyed residential street, burnt cars and smouldering rubble" },
  { src: aftermathClip.url, alt: "A burned neighbourhood at dawn, smoking rubble and ash" },
];

export function ActOpening() {
  const [shot, setShot] = useState(0);
  const [dark, setDark] = useState(false);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const total = reel.length * SHOT_MS;
    const id = window.setInterval(() => setShot((s) => (s + 1) % reel.length), SHOT_MS);
    const cut = window.setTimeout(() => setDark(true), total);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(cut);
    };
  }, []);

  // exactly one video decodes at a time; the next one is warmed just before its cut
  useEffect(() => {
    videos.current.forEach((el, i) => {
      if (!el) return;
      if (i === shot && !dark) {
        el.currentTime = 0;
        void el.play().catch(() => {});
      } else {
        el.pause();
        if (i === (shot + 1) % reel.length && el.preload !== "auto") el.preload = "auto";
      }
    });
  }, [shot, dark]);

  return (
    <section
      aria-label="See the fire sooner"
      className="relative isolate h-svh overflow-hidden bg-black"
    >
      {reel.map((s, i) => (
        <div
          key={i}
          className="reel-shot"
          style={{
            opacity: !dark && i === shot ? 1 : 0,
            visibility: !dark && i === shot ? "visible" : "hidden",
          }}
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
            poster={aftermath}
            aria-label={s.alt}
          >
            <source src={s.src} type="video/mp4" />
          </video>
        </div>
      ))}

      {!dark && <div className="reel-grade" aria-hidden />}
      <div className="pointer-events-none absolute inset-0 film-grain" aria-hidden />

      {/* the cut to black, then the words */}
      <div
        className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-[1600ms]"
        style={{ opacity: dark ? 1 : 0 }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-5 text-center sm:px-8">
        {dark && (
          <>
            <p
              className="reel-line !text-center text-[0.72rem] tracking-[0.4em] uppercase opacity-0 [animation:reel-in_2.4s_ease_forwards]"
              style={{ animationDelay: "1.2s" }}
            >
              January. Winds at sixty.
            </p>
            <p
              className="reel-line !text-center text-[clamp(1rem,2.4vw,1.5rem)] opacity-0 [animation:reel-in_2.4s_ease_forwards]"
              style={{ animationDelay: "3.2s" }}
            >
              A whole neighbourhood, gone before anyone could reach it.
            </p>
            <h1
              className="display-cond mt-6 text-[clamp(3.2rem,10vw,8rem)] leading-[0.88] text-ink opacity-0 [animation:reel-in_2.6s_ease_forwards]"
              style={{ animationDelay: "5.4s" }}
            >
              See the fire sooner.
            </h1>
            <div
              className="mt-10 flex flex-col items-center gap-4 opacity-0 [animation:reel-in_2s_ease_forwards]"
              style={{ animationDelay: "7.4s" }}
            >
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-[var(--signal)]">
                Wildfire detection · UAV response
              </span>
              <span className="reel-cue" aria-hidden />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
