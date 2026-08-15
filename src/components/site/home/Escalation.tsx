import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import fireClip from "@/assets/hero-fire-aerial.mp4.asset.json";
import tornadoClip from "@/assets/reel-tornado.mp4.asset.json";
import floodClip from "@/assets/reel-flood.mp4.asset.json";
import poster from "@/assets/act-fire.jpg";

const beats = [
  {
    src: fireClip.url,
    kicker: "Fire",
    title: "The season no longer ends.",
    body: "Fire weather now shows up in months that used to be safe. Ground that used to burn once in a generation burns again before it has grown back.",
    alt: "Aerial footage of a wildfire burning through forest",
  },
  {
    src: tornadoClip.url,
    kicker: "Wind",
    title: "Warning time is measured in minutes.",
    body: "A tornado gives a town minutes, not hours. What happens in those minutes depends almost entirely on how fast somebody knew.",
    alt: "A tornado crossing farmland",
  },
  {
    src: floodClip.url,
    kicker: "Water",
    title: "Water arrives faster than the map says.",
    body: "Flash flooding rewrites a neighbourhood in an afternoon, and the people who have to drive into it often go in blind.",
    alt: "A flooded neighbourhood seen from the air",
  },
];

function Beat({ b, i }: { b: (typeof beats)[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const flip = i % 2 === 1;

  return (
    <div
      ref={ref}
      className={`grid items-center gap-6 lg:grid-cols-2 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}
    >
      <div className="bento relative h-[54vh] min-h-[340px] overflow-hidden bg-black">
        <motion.video
          style={{ y }}
          className="h-[120%] w-full object-cover opacity-90"
          muted
          loop
          playsInline
          preload="none"
          poster={i === 0 ? poster : undefined}
          aria-label={b.alt}
          onMouseEnter={(e) => void e.currentTarget.play().catch(() => {})}
          ref={(el) => {
            if (!el) return;
            const io = new IntersectionObserver(
              ([entry]) => (entry.isIntersecting ? void el.play().catch(() => {}) : el.pause()),
              { threshold: 0.25 },
            );
            io.observe(el);
          }}
        >
          <source src={b.src} type="video/mp4" />
        </motion.video>
        <span className="absolute left-5 top-5 rounded-full bg-black/55 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-white/85 backdrop-blur">
          {b.kicker}
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="bento h-full bg-[var(--sheet)] p-8 sm:p-12"
      >
        <p className="label">Getting worse · 0{i + 1}</p>
        <h3 className="mt-4 text-[clamp(1.9rem,4.2vw,3.2rem)] font-extrabold leading-[1.03] tracking-tight text-ink">
          {b.title}
        </h3>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/70">{b.body}</p>
      </motion.div>
    </div>
  );
}

/** Three vivid beats: fire, wind, water — and why the curve keeps bending. */
export function Escalation() {
  return (
    <section className="px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {beats.map((b, i) => (
          <Beat key={b.kicker} b={b} i={i} />
        ))}
      </div>
    </section>
  );
}
