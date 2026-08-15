import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Hand, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { Uav3D } from "./Uav3D";

const line = "Get there before it is big.";

/** A cursor-reactive tile: it tips a few degrees toward the pointer. */
function TiltCard({
  children,
  className = "",
  strength = 8,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [strength, -strength]), { stiffness: 140, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-strength, strength]), { stiffness: 140, damping: 18 });

  return (
    <motion.div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Slow drifting sun + ridges behind the hero. */
function Skyline() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.span
        className="blob blob-a"
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="blob blob-b"
        animate={{ x: [0, -50, 30, 0], y: [0, 25, -25, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg className="absolute inset-x-0 bottom-0 h-[38%] w-full" viewBox="0 0 1440 260" preserveAspectRatio="none">
        <path d="M0 190 L220 110 L420 178 L640 96 L860 172 L1080 104 L1280 168 L1440 120 L1440 260 L0 260 Z" fill="var(--hill-far)" />
        <path d="M0 226 L200 168 L400 218 L620 156 L840 214 L1060 162 L1260 216 L1440 178 L1440 260 L0 260 Z" fill="var(--hill-near)" />
      </svg>
    </div>
  );
}

/** The opening: one clear promise, one aircraft you can spin with your hand. */
export function HeroBento() {
  const cue = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = cue.current;
    if (!el) return;
    const t = window.setTimeout(() => el.classList.add("opacity-0"), 6000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section className="relative isolate overflow-hidden px-4 pb-10 pt-28 sm:px-6 sm:pt-32 lg:pt-36">
      <Skyline />

      <div className="relative mx-auto grid max-w-7xl gap-4 lg:grid-cols-12">
        {/* headline tile */}
        <TiltCard className="lg:col-span-7" strength={4}>
          <div className="bento h-full bg-[var(--sheet)] p-8 sm:p-12">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="pill"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              A nonprofit building disaster-response tech in the open
            </motion.span>

            <h1 className="mt-7 text-[clamp(2.6rem,6.2vw,5.2rem)] font-extrabold leading-[0.95] tracking-tight text-ink">
              {line.split(" ").map((w, i) => (
                <motion.span
                  key={`${w}-${i}`}
                  className="inline-block will-change-transform"
                  initial={{ opacity: 0, y: 26, rotate: 3 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 0.12 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w === "big." ? <em className="not-italic text-[var(--signal)]">{w}</em> : w}
                  &nbsp;
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70"
            >
              Most disasters begin where nobody is watching. We are building sensors that notice, people who
              check, and an aircraft that goes to look — so responders get a real picture, early. Wildfire is
              where we start; wind, water and quake are the same problem.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.78, duration: 0.7 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link to="/donate" className="btn-leaf group">
                Support the mission
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link to="/system" className="btn-ghost">
                See how it works
              </Link>
            </motion.div>
          </div>
        </TiltCard>

        {/* aircraft tile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5"
        >
          <div className="bento relative h-[440px] overflow-hidden bg-[var(--surface)] lg:h-full">
            <Uav3D className="absolute inset-0" />
            <div className="pointer-events-none absolute left-6 top-6">
              <p className="label">The aircraft</p>
              <p className="mt-1 text-sm text-ink/60">VTOL · thermal + RGB · water payload</p>
            </div>
            <span
              ref={cue}
              className="pointer-events-none absolute bottom-6 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--sheet)]/85 px-4 py-2 text-xs font-semibold text-ink/70 backdrop-blur transition-opacity duration-700"
            >
              <Hand className="h-3.5 w-3.5" aria-hidden />
              Drag to turn it
            </span>
          </div>
        </motion.div>

        {/* three quick facts */}
        {[
          { k: "Where it starts", v: "Remote ground, no camera, no lookout" },
          { k: "What we build", v: "Sensors, ops software and a VTOL aircraft" },
          { k: "Who decides", v: "People — every mission is authorized" },
        ].map((f: { k: string; v: string }, i: number) => (
          <motion.div
            key={f.k}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 + i * 0.1, duration: 0.6 }}
            className="lg:col-span-4"
          >
            <div className="bento group h-full bg-[var(--sheet)] p-6 transition-colors hover:bg-[var(--surface)]">
              <p className="label">{f.k}</p>
              <p className="mt-2 text-lg font-semibold leading-snug text-ink">{f.v}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
