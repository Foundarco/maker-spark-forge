import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { beats } from "@/config/journey";
import { JourneyFallback } from "./JourneyFallback";

const N = beats.length;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * The homepage mission flight.
 *
 * One tall scroll track drives ONE normalized timeline (0 → 1). A single
 * requestAnimationFrame loop reads the track position, smooths it, and writes
 * transforms directly to cached DOM nodes — no React state, no per-section
 * scroll listeners, no re-renders while scrolling.
 *
 * Visually it is a composited photographic flight: each beat is a real
 * photographic plate with a continuous slow push and a colour grade, so the
 * palette travels with the story (dawn blue → amber detection → operations
 * cyan → fire ember → thermal → dusk response).
 */
export function MissionJourney() {
  const track = useRef<HTMLDivElement>(null);
  const plates = useRef<(HTMLDivElement | null)[]>([]);
  const texts = useRef<(HTMLDivElement | null)[]>([]);
  const bar = useRef<HTMLSpanElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState<boolean | null>(null);
  /** Only used for the expandable technical detail, never during scroll. */
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    setReduced(!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced !== false) return;
    let raf = 0;
    let last = performance.now();
    let s = 0; // smoothed progress
    const state = { op: [] as number[] };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const el = track.current;
      if (!el) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const rect = el.getBoundingClientRect();
      const span = el.offsetHeight - window.innerHeight;
      const target = clamp01(-rect.top / Math.max(1, span));
      // frame-rate independent critical damping
      s += (target - s) * (1 - Math.pow(0.0009, dt));
      if (Math.abs(target - s) < 0.00005) s = target;

      const t = s * (N - 1);

      for (let i = 0; i < N; i++) {
        const plate = plates.current[i];
        const text = texts.current[i];
        const u = t - i;
        const au = Math.abs(u);

        if (plate) {
          const a = clamp01(1 - au / 1.02);
          const prev = state.op[i];
          if (a <= 0.002) {
            if (prev !== 0) {
              plate.style.opacity = "0";
              plate.style.visibility = "hidden";
              state.op[i] = 0;
            }
          } else {
            if (prev === 0 || prev === undefined) plate.style.visibility = "visible";
            plate.style.opacity = a.toFixed(3);
            // continuous push: the frame is always drifting in, never static
            const k = clamp01((u + 1.1) / 2.2);
            const scale = 1.18 - 0.18 * k;
            plate.style.transform = `translate3d(${(u * -1.4).toFixed(2)}%, ${(u * -2.2).toFixed(2)}%, 0) scale(${scale.toFixed(4)})`;
            state.op[i] = a;
          }
        }

        if (text) {
          const a = clamp01(1 - au / 0.58);
          const e = a * a * (3 - 2 * a);
          text.style.opacity = e.toFixed(3);
          text.style.transform = `translate3d(0, ${(u * -44).toFixed(1)}px, 0)`;
          const on = e > 0.45;
          text.style.visibility = e < 0.01 ? "hidden" : "visible";
          text.style.pointerEvents = on ? "auto" : "none";
        }
      }

      if (bar.current) bar.current.style.transform = `scaleX(${s.toFixed(4)})`;
      if (cue.current) cue.current.style.opacity = clamp01(1 - t * 3).toFixed(3);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  if (reduced === null) {
    // First paint: render the opening plate only, so the LCP image is real.
    return (
      <section className="relative h-screen overflow-hidden bg-[#070c14]">
        <img
          src={beats[0]!.img}
          alt="California mountain ridgelines at dawn"
          className="absolute inset-0 h-full w-full object-cover"
          width={1600}
          height={900}
        />
        <div className="absolute inset-0" style={{ background: beats[0]!.grade }} aria-hidden />
      </section>
    );
  }

  if (reduced) return <JourneyFallback />;

  return (
    <section
      ref={track}
      className="relative bg-[#070c14]"
      style={{ height: `${N * 96}vh` }}
      aria-label="Mission journey: from sensor detection to responder"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* photographic plates — one per beat, composited on the GPU */}
        {beats.map((b, i) => (
          <div
            key={`${b.id}-plate`}
            ref={(el) => {
              plates.current[i] = el;
            }}
            className="absolute inset-0 will-change-transform"
            style={{
              opacity: i === 0 ? 1 : 0,
              visibility: i === 0 ? "visible" : "hidden",
              transform: "scale(1.08)",
            }}
            aria-hidden
          >
            <img
              src={b.img}
              alt=""
              width={1600}
              height={900}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "low"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: b.focus ?? "50% 50%", filter: b.filter }}
            />
            <div className="absolute inset-0" style={{ background: b.grade }} />
            {/* left-side legibility falloff, kept light so colour survives */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(100deg, rgba(6,10,18,0.68) 0%, rgba(6,10,18,0.30) 34%, transparent 62%)",
              }}
            />
          </div>
        ))}

        {/* global atmosphere: soft vignette only */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(140% 100% at 50% 45%, transparent 55%, rgba(4,7,12,0.55) 100%)" }}
          aria-hidden
        />

        {/* copy — one block per beat, cross-faded by the same timeline */}
        <div className="pointer-events-none absolute inset-0">
          <div className="relative mx-auto h-full w-full max-w-7xl px-5 sm:px-8">
            {beats.map((b, i) => {
              const tone =
                b.tone === "signal" ? "var(--signal)" : b.tone === "data" ? "#5ec8f5" : "#e7eef7";
              const first = i === 0;
              const last = i === N - 1;
              return (
                <div
                  key={`${b.id}-copy`}
                  ref={(el) => {
                    texts.current[i] = el;
                  }}
                  className="absolute inset-x-5 bottom-24 will-change-transform sm:inset-x-8 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
                  style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
                >
                  <div className="max-w-xl">
                    <p
                      className="flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.28em]"
                      style={{ color: tone }}
                    >
                      <span className="tabular-nums">{b.code}</span>
                      <span className="h-px w-8" style={{ background: tone }} />
                      {b.label}
                    </p>
                    <h2
                      className={`display-cond mt-5 text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] ${
                        first ? "text-[clamp(3rem,9vw,7.5rem)]" : "text-[clamp(2.2rem,5.2vw,4.4rem)]"
                      }`}
                    >
                      {b.title}
                    </h2>
                    <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
                      {b.line}
                    </p>

                    {b.detail ? (
                      <div className="mt-5">
                        <button
                          type="button"
                          onClick={() => setOpen((v) => (v === b.id ? null : b.id))}
                          aria-expanded={open === b.id}
                          className="border border-white/25 bg-black/20 px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm transition-colors hover:border-white/60 hover:text-white"
                        >
                          {open === b.id ? "Hide detail" : "Technical detail +"}
                        </button>
                        {open === b.id ? (
                          <p className="mt-3 max-w-md border-l border-white/25 pl-4 text-sm leading-relaxed text-white/70">
                            {b.detail}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {first ? (
                      <div className="mt-9 flex flex-wrap items-center gap-4">
                        <Link
                          to="/system"
                          className="border border-[color:var(--signal)] bg-[var(--signal)] px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[#10131a] transition-opacity hover:opacity-90"
                        >
                          Explore the system
                        </Link>
                        <Link
                          to="/mission"
                          className="border border-white/35 bg-black/20 px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm transition-colors hover:border-white/70 hover:text-white"
                        >
                          Our mission
                        </Link>
                      </div>
                    ) : null}

                    {last ? (
                      <div className="mt-9 flex flex-wrap gap-3">
                        <Link
                          to="/system"
                          className="border border-white/35 bg-black/20 px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm transition-colors hover:border-white/70 hover:text-white"
                        >
                          Walk the full architecture
                        </Link>
                        <Link
                          to="/donate"
                          className="border border-[color:var(--signal)] bg-[var(--signal)] px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[#10131a] transition-opacity hover:opacity-90"
                        >
                          Support the mission
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* single, quiet progress rule */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/15" aria-hidden>
          <span
            ref={bar}
            className="block h-px w-full origin-left bg-[var(--signal)] will-change-transform"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        <div
          ref={cue}
          className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center"
          aria-hidden
        >
          <span className="journey-cue font-mono text-[0.6rem] uppercase tracking-[0.3em] text-white/65">
            Begin mission ↓
          </span>
        </div>
      </div>
    </section>
  );
}
