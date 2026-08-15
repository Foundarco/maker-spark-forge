import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import fireClip from "@/assets/hero-fire-aerial.mp4.asset.json";
import tornadoClip from "@/assets/reel-tornado.mp4.asset.json";
import floodClip from "@/assets/reel-flood.mp4.asset.json";
import stormClip from "@/assets/reel-storm.mp4.asset.json";
import hoodClip from "@/assets/reel-neighborhood-1.mp4.asset.json";
import hood2Clip from "@/assets/reel-neighborhood-2.mp4.asset.json";
import evacueesClip from "@/assets/reel-evacuees.mp4.asset.json";
import houseClip from "@/assets/reel-house-burning.mp4.asset.json";
import aftermathClip from "@/assets/reel-aftermath.mp4.asset.json";
import rainClip from "@/assets/reel-rain-ruins.mp4.asset.json";
import poster from "@/assets/act-aftermath.jpg";

const SHOT_MS = 4200;

const reel = [
  { src: fireClip.url, label: "Wildfire", alt: "Aerial view of a wildfire burning through forest" },
  { src: tornadoClip.url, label: "Tornado", alt: "A tornado crossing open farmland under a dark sky" },
  { src: floodClip.url, label: "Flood", alt: "A flooded neighbourhood with water up to the rooftops" },
  { src: stormClip.url, label: "Hurricane", alt: "Storm damage on a coastal street in heavy rain" },
  { src: houseClip.url, label: "Structure fire", alt: "A house fully involved in flames at night" },
  { src: evacueesClip.url, label: "Evacuation", alt: "Residents evacuating with their belongings" },
  { src: hoodClip.url, label: "Aftermath", alt: "A burned neighbourhood reduced to smouldering foundations" },
  { src: hood2Clip.url, label: "Aftermath", alt: "Smouldering foundations where homes once stood" },
  { src: rainClip.url, label: "After the storm", alt: "Rain falling over destroyed buildings" },
  { src: aftermathClip.url, label: "Recovery", alt: "Survey of a destroyed neighbourhood after the fire" },
];

/** The opening cut-scenes: the disasters, one after another, then the promise. */
export function DisasterReel() {
  const [shot, setShot] = useState(0);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const id = window.setInterval(() => setShot((s) => (s + 1) % reel.length), SHOT_MS);
    return () => {
      window.clearInterval(id);
    };
  }, []);

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
      aria-label="Natural disasters are getting worse"
      className="relative isolate flex h-svh items-end overflow-hidden bg-[var(--night)]"
    >
      {reel.map((s, i) => (
        <div
          key={s.label}
          className="absolute inset-0 transition-opacity duration-[1400ms]"
          style={{ opacity: i === shot ? 1 : 0 }}
          aria-hidden={i !== shot}
        >
          <video
            ref={(el) => {
              videos.current[i] = el;
            }}
            className="h-full w-full scale-105 object-cover"
            muted
            loop
            playsInline
            preload={i === 0 ? "auto" : "none"}
            poster={i === 0 ? poster : undefined}
            aria-label={s.alt}
          >
            <source src={s.src} type="video/mp4" />
          </video>
        </div>
      ))}

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/55 transition-opacity duration-[1600ms]"
        style={{ opacity: 0.9 }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.2 }}
          className="label text-[var(--signal)]"
        >
          Fire · Wind · Water · Earth
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 text-[clamp(3.4rem,13vw,11rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.04em] text-ink"
        >
          See it first
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1.2 }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-ink/75"
        >
          Wildfire, tornado, flood, hurricane — they all begin somewhere nobody is watching. We are a nonprofit
          building the sensing, software and aircraft that get there first.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1, duration: 1 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <a href="/mission" className="btn-leaf text-sm">
            See the mission ↗
          </a>
          <span className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink/55">
            <span className="inline-block h-8 w-[1px] animate-pulse bg-[var(--signal)]" aria-hidden />
            Scroll to begin
          </span>
        </motion.div>
      </div>

    </section>
  );
}
