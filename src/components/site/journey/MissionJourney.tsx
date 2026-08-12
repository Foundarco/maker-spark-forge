import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { beats } from "@/config/journey";
import { JourneyFallback } from "./JourneyFallback";

const MissionScene = lazy(() => import("./MissionScene"));

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (p: number, a: number, b: number) => {
  const t = clamp01((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function supports3D() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.innerWidth < 900) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The homepage mission flight. A tall scroll track drives one sticky scene:
 * scroll position is the mission timeline. Falls back to a layered 2D
 * presentation on mobile, reduced-motion, or without WebGL.
 */
export function MissionJourney() {
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef({ current: 0 });
  const hud = useRef<HTMLDivElement>(null);
  const thermal = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [beat, setBeat] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => setEnabled(supports3D()), []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = track.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const span = el.offsetHeight - window.innerHeight;
      const p = clamp01(-rect.top / Math.max(1, span));
      progress.current.current = p;

      const idx = Math.min(beats.length - 1, Math.floor(p * beats.length * 0.999));
      setBeat((b) => (b === idx ? b : idx));

      if (thermal.current) {
        const t = ramp(p, 0.66, 0.76) * (1 - ramp(p, 0.84, 0.9));
        thermal.current.style.opacity = String(t);
      }
      if (hud.current) hud.current.style.opacity = String(ramp(p, 0.02, 0.09));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  useEffect(() => setExpanded(false), [beat]);

  if (enabled === false) return <JourneyFallback />;

  const b = beats[beat]!;
  const toneColor =
    b.tone === "signal" ? "var(--signal)" : b.tone === "data" ? "#38bdf8" : "currentColor";

  return (
    <section
      ref={track}
      className="relative bg-[#0b0f14]"
      style={{ height: `${beats.length * 85}vh` }}
      aria-label="Mission journey: from sensor detection to responder"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 3D scene */}
        <div className="absolute inset-0">
          {enabled ? (
            <Suspense fallback={null}>
              <MissionScene progress={progress.current} />
            </Suspense>
          ) : null}
        </div>

        {/* thermal sweep */}
        <div
          ref={thermal}
          className="journey-thermal pointer-events-none absolute inset-0"
          style={{ opacity: 0 }}
          aria-hidden
        />
        <div className="scanlines pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(8,11,16,0.88) 0%, rgba(8,11,16,0.62) 34%, rgba(8,11,16,0.05) 58%, transparent 78%), radial-gradient(130% 90% at 60% 45%, transparent 55%, rgba(6,9,13,0.5) 100%)",
          }}
          aria-hidden
        />

        {/* HUD frame */}
        <div
          ref={hud}
          className="pointer-events-none absolute inset-0 hidden font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/55 lg:block"
          style={{ opacity: 0 }}
          aria-hidden
        >
          <div className="absolute left-6 top-24 flex items-center gap-2">
            <span className="live-pulse h-1.5 w-1.5 rounded-full bg-[var(--signal)]" />
            Mission 01 · Wildfire · Concept simulation
          </div>
          <div className="absolute right-6 top-24 space-y-1.5 text-right">
            <p>UAV-01 · {beat >= 6 ? "Airborne" : "Standby"}</p>
            <p>Network · {beat >= 2 ? "12 nodes reporting" : "Initialising"}</p>
            <p>Ops center · 24/7/365</p>
          </div>
          <div className="absolute bottom-8 left-6 right-6 flex items-center gap-2">
            {beats.map((x, i) => (
              <span
                key={x.id}
                className="h-px flex-1 transition-colors duration-500"
                style={{ background: i <= beat ? "var(--signal)" : "rgba(255,255,255,0.16)" }}
              />
            ))}
          </div>
        </div>

        {/* Beat copy */}
        <div className="pointer-events-none absolute inset-0">
          <div className="mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-5 pb-24 sm:px-8 lg:justify-center lg:pb-0">
            <div key={b.id} className="journey-beat max-w-xl">
              <p
                className="flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.28em]"
                style={{ color: toneColor }}
              >
                <span className="tabular-nums">{b.code}</span>
                <span className="h-px w-8" style={{ background: toneColor }} />
                {b.label}
              </p>
              <h2
                className={`display-cond mt-5 text-ink ${
                  beat === 0 ? "text-[clamp(3rem,9vw,7.5rem)]" : "text-[clamp(2.2rem,5.2vw,4.4rem)]"
                }`}
              >
                {b.title}
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">{b.line}</p>

              {b.detail ? (
                <div className="pointer-events-auto mt-5">
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                    className="border border-white/20 px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/50 hover:text-white"
                  >
                    {expanded ? "Hide detail" : "Technical detail +"}
                  </button>
                  {expanded ? (
                    <p className="mt-3 max-w-md border-l border-white/20 pl-4 text-sm leading-relaxed text-white/60">
                      {b.detail}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {beat === 0 ? (
                <div className="pointer-events-auto mt-9 flex flex-wrap items-center gap-4">
                  <Link
                    to="/system"
                    className="border border-[color:var(--signal)] bg-[var(--signal)] px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[#10131a] transition-opacity hover:opacity-90"
                  >
                    Explore the system
                  </Link>
                  <Link
                    to="/mission"
                    className="border border-white/25 px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/80 transition-colors hover:border-white/60 hover:text-white"
                  >
                    Our mission
                  </Link>
                </div>
              ) : null}

              {beat === beats.length - 1 ? (
                <div className="pointer-events-auto mt-9">
                  <Link
                    to="/system"
                    className="border border-white/25 px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/80 transition-colors hover:border-white/60 hover:text-white"
                  >
                    Walk the full architecture
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* scroll cue */}
        {beat === 0 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
            <span className="journey-cue font-mono text-[0.6rem] uppercase tracking-[0.3em] text-white/60">
              Begin mission ↓
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
