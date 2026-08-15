import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";
import fireClip from "@/assets/hero-fire-aerial.mp4.asset.json";
import tornadoClip from "@/assets/reel-tornado.mp4.asset.json";
import floodClip from "@/assets/reel-flood.mp4.asset.json";
import stormClip from "@/assets/reel-storm.mp4.asset.json";
import hoodClip from "@/assets/reel-neighborhood-1.mp4.asset.json";

const chapters = [
  {
    src: fireClip.url,
    tag: "Chapter 01 — Fire",
    stat: "7.6M acres",
    statNote: "burned in a single U.S. season",
    title: "It starts somewhere nobody is looking.",
    body: "A fire begins on ground with no camera, no lookout and no crew within an hour's drive. By the time it is reported, it is already worth reporting.",
    alt: "Aerial footage of a wildfire burning through forest",
  },
  {
    src: tornadoClip.url,
    tag: "Chapter 02 — Wind",
    stat: "13 minutes",
    statNote: "median tornado warning lead time",
    title: "Warning time is measured in minutes.",
    body: "A town gets minutes, not hours. What happens inside those minutes depends almost entirely on how quickly somebody knew, and how quickly that knowledge moved.",
    alt: "A tornado crossing open farmland",
  },
  {
    src: floodClip.url,
    tag: "Chapter 03 — Water",
    stat: "Hours",
    statNote: "for a flash flood to redraw a town",
    title: "Water arrives faster than the map says.",
    body: "Flash flooding rewrites a neighbourhood in an afternoon. The crews who have to drive into it are working from a picture of the world that is already out of date.",
    alt: "A flooded neighbourhood seen from the air",
  },
  {
    src: stormClip.url,
    tag: "Chapter 04 — Storm",
    stat: "$1B+",
    statNote: "disasters, now several dozen a year",
    title: "The exceptional year became the normal one.",
    body: "Billion-dollar events used to be rare enough to name. Now they stack on top of each other, and the same responders are asked to cover more ground with the same hours.",
    alt: "Storm damage on a coastal street in heavy rain",
  },
  {
    src: hoodClip.url,
    tag: "Chapter 05 — After",
    stat: "The gap",
    statNote: "between ignition and information",
    title: "Almost all of the damage happens in the gap.",
    body: "Between the moment something starts and the moment somebody reliable sees it, there is a window. Close that window and everything downstream gets easier.",
    alt: "A burned neighbourhood reduced to smouldering foundations",
  },
] as const;

function Layer({
  c,
  i,
  p,
  count,
}: {
  c: (typeof chapters)[number];
  i: number;
  p: MotionValue<number>;
  count: number;
}) {
  const seg = 1 / count;
  const start = i * seg;
  const opacity = useTransform(
    p,
    [start - seg * 0.42, start + seg * 0.12, start + seg * 0.82, start + seg * 1.25],
    [0, 1, 1, 0],
  );
  const scale = useTransform(p, [start - seg, start + seg], [1.18, 1.02]);
  const y = useTransform(p, [start - seg, start + seg], ["4%", "-4%"]);
  const textY = useTransform(
    p,
    [start - seg * 0.4, start + seg * 0.15, start + seg * 0.85, start + seg * 1.2],
    [70, 0, 0, -70],
  );

  return (
    <>
      <motion.div style={{ opacity }} className="absolute inset-0" aria-hidden={i !== 0}>
        <motion.video
          style={{ scale, y }}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          preload={i === 0 ? "auto" : "none"}
          aria-label={c.alt}
          ref={(el) => {
            if (!el) return;
            const io = new IntersectionObserver(
              ([e]) => (e && e.isIntersecting ? void el.play().catch(() => {}) : el.pause()),
              { threshold: 0.05 },
            );
            io.observe(el);
          }}
        >
          <source src={c.src} type="video/mp4" />
        </motion.video>
      </motion.div>

      <motion.div
        style={{ opacity, y: textY }}
        className="pointer-events-none absolute inset-0 flex items-end"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 pb-14 sm:px-8 sm:pb-20 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div>
            <p className="label text-[var(--signal)]">{c.tag}</p>
            <h2 className="mt-4 max-w-3xl text-[clamp(2rem,5vw,4.2rem)] font-bold leading-[1.02] tracking-tight text-ink">
              {c.title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/70 sm:text-lg">{c.body}</p>
          </div>
          <div className="bento bg-[color-mix(in_oklab,var(--night)_62%,transparent)] p-6 backdrop-blur-md">
            <p className="text-[clamp(1.8rem,3.4vw,2.8rem)] font-bold leading-none tracking-tight text-ink">
              {c.stat}
            </p>
            <p className="mt-3 text-sm leading-snug text-ink/60">{c.statNote}</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/**
 * The centrepiece: a scroll-locked film. The viewport pins while five
 * chapters of disaster footage and type cross-dissolve under the scroll.
 */
export function PinnedStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const railScale = useTransform(p, [0, 1], [0, 1]);

  return (
    <section
      ref={ref}
      aria-label="Why disaster response is getting harder"
      style={{ height: `${chapters.length * 100}svh` }}
      className="relative bg-[var(--night)]"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {chapters.map((c, i) => (
          <Layer key={c.tag} c={c} i={i} p={p} count={chapters.length} />
        ))}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--night)_88%,transparent)_0%,color-mix(in_oklab,var(--night)_30%,transparent)_36%,color-mix(in_oklab,var(--night)_92%,transparent)_100%)]"
        />
        <div aria-hidden className="grid-fine pointer-events-none absolute inset-0 opacity-40" />

        {/* chapter rail */}
        <div className="pointer-events-none absolute left-5 top-1/2 hidden -translate-y-1/2 flex-col gap-3 sm:left-8 lg:flex">
          {chapters.map((c, i) => (
            <Tick key={c.tag} p={p} i={i} count={chapters.length} />
          ))}
        </div>

        <motion.span
          aria-hidden
          style={{ scaleX: railScale }}
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[var(--signal)]"
        />
      </div>
    </section>
  );
}

function Tick({ p, i, count }: { p: MotionValue<number>; i: number; count: number }) {
  const seg = 1 / count;
  const active = useTransform(p, [i * seg - seg * 0.3, i * seg + seg * 0.1, (i + 1) * seg], [0.25, 1, 0.25]);
  const w = useTransform(active, [0.25, 1], [14, 40]);
  return (
    <motion.span
      style={{ opacity: active, width: w }}
      className="block h-[2px] rounded-full bg-[var(--signal)]"
    />
  );
}
