import { Link } from "@tanstack/react-router";
import { motion, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const line: Variants = {
  hidden: { y: "110%" },
  shown: { y: "0%", transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};
import { ArrowUpRight } from "lucide-react";
import ridgeDawn from "@/assets/hero-ridgeline-dawn.mp4.asset.json";
import fireAerial from "@/assets/hero-fire-aerial.mp4.asset.json";
import californiaFlight from "@/assets/journey-california-flight.mp4.asset.json";
import incidentFlight from "@/assets/journey-incident-flight.mp4.asset.json";
import ridge from "@/assets/j-ridge.jpg";
import fire from "@/assets/j-fire.jpg";
import canyon from "@/assets/j-canyon.jpg";
import ops from "@/assets/j-ops.jpg";
import { brand } from "@/config/brand";

type Cut =
  | { kind: "video"; src: string; poster: string; hold: number; from: string; to: string }
  | { kind: "image"; src: string; hold: number; from: string; to: string };

/**
 * Continuous cut-scene reel. Long, slow dissolves; every plate keeps moving,
 * graded and grained so it reads as film rather than a slideshow.
 */
const cuts: Cut[] = [
  {
    kind: "video",
    src: ridgeDawn.url,
    poster: ridge,
    hold: 8200,
    from: "scale(1.06)",
    to: "scale(1.14) translate3d(-1%,-1%,0)",
  },
  {
    kind: "video",
    src: californiaFlight.url,
    poster: canyon,
    hold: 8200,
    from: "scale(1.12) translate3d(1%,0,0)",
    to: "scale(1.02)",
  },
  {
    kind: "video",
    src: fireAerial.url,
    poster: fire,
    hold: 6200,
    from: "scale(1.04)",
    to: "scale(1.16) translate3d(1%,-1%,0)",
  },
  {
    kind: "video",
    src: incidentFlight.url,
    poster: canyon,
    hold: 7200,
    from: "scale(1.14) translate3d(-1%,1%,0)",
    to: "scale(1.02)",
  },
  {
    kind: "image",
    src: ops,
    hold: 4200,
    from: "scale(1.02) translate3d(2%,0,0)",
    to: "scale(1.22) translate3d(-2%,-1%,0)",
  },
];

const DISSOLVE = 1400;

export function FilmHero() {
  const inner = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(
      () => setIndex((i) => (i + 1) % cuts.length),
      cuts[index]?.hold ?? 6000,
    );
    return () => window.clearTimeout(t);
  }, [index]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
      if (inner.current) {
        inner.current.style.transform = `translate3d(0, ${(p * 14).toFixed(2)}vh, 0) scale(${(1 + p * 0.1).toFixed(4)})`;
        inner.current.style.filter = `brightness(${(1 - p * 0.5).toFixed(3)})`;
      }
      if (copy.current) {
        copy.current.style.transform = `translate3d(0, ${(-p * 22).toFixed(2)}vh, 0)`;
        copy.current.style.opacity = (1 - p * 1.4).toFixed(3);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative h-[100svh] overflow-hidden bg-[var(--night)]">
      <div ref={inner} className="absolute inset-0 will-change-transform">
        {cuts.map((cut, i) => {
          const active = i === index;
          const motion = {
            transform: active ? cut.to : cut.from,
            transition: active
              ? `transform ${cut.hold + DISSOLVE * 2}ms linear`
              : "none",
          } as const;
          return (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                opacity: active ? 1 : 0,
                transition: `opacity ${DISSOLVE}ms cubic-bezier(0.4,0,0.2,1)`,
              }}
              aria-hidden={!active}
            >
              {cut.kind === "video" ? (
                <video
                  className="h-full w-full object-cover will-change-transform"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload={i === 0 ? "auto" : "metadata"}
                  poster={cut.poster}
                  style={motion}
                >
                  <source src={cut.src} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={cut.src}
                  alt=""
                  className="h-full w-full object-cover will-change-transform"
                  style={motion}
                  loading={i > 1 ? "lazy" : "eager"}
                />
              )}
            </div>
          );
        })}

        {/* Colour grade: cool shadows, warm signal highlight */}
        <div className="pointer-events-none absolute inset-0 mix-blend-soft-light bg-[radial-gradient(120%_90%_at_70%_10%,rgba(255,176,74,0.55)_0%,rgba(255,176,74,0)_45%),linear-gradient(180deg,rgba(10,26,48,0.7)_0%,rgba(10,26,48,0)_55%)]" />
        {/* Depth + legibility */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,22,0.62)_0%,rgba(6,12,22,0.06)_38%,rgba(6,12,22,0.55)_74%,rgba(6,12,22,0.96)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(115%_85%_at_50%_45%,transparent_45%,rgba(4,8,16,0.75)_100%)]" />
        <div className="film-grain pointer-events-none absolute inset-0" aria-hidden />
      </div>

      <motion.div
        ref={copy}
        initial="hidden"
        animate="shown"
        variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } } }}
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-6 pb-16 pt-36 will-change-transform sm:px-10"
      >
        <h1 className="display-cond max-w-4xl text-[clamp(4rem,13vw,11rem)] leading-[0.86] text-ink drop-shadow-[0_6px_40px_rgb(0_0_0/0.6)]">
          <span className="block overflow-hidden">
            <motion.span className="block" variants={line}>See it</motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span className="block" variants={line}>sooner</motion.span>
          </span>
        </h1>

        <div className="max-w-xl">
          <motion.p variants={rise} className="text-xl leading-snug text-ink/90 sm:text-2xl">
            Autonomous wildfire detection. Investigated from the air in minutes, not hours.
          </motion.p>
          <motion.div variants={rise} className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/mission"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-[var(--night)] transition-transform duration-200 ease-out hover:scale-[1.03]"
            >
              Our mission
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-ink/80">
              <span className="live-pulse h-1.5 w-1.5 rounded-full bg-[var(--signal)]" aria-hidden />
              {brand.status}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[0.56rem] uppercase tracking-[0.3em] text-ink/55">Scroll</span>
        <span className="h-10 w-px overflow-hidden bg-white/20">
          <span className="block h-4 w-px animate-[cue_2.2s_ease-in-out_infinite] bg-[var(--signal)]" />
        </span>
      </motion.div>
    </section>
  );
}
