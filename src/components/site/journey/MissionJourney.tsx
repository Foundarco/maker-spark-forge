import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { beats } from "@/config/journey";
import { JourneyFallback } from "./JourneyFallback";

const MissionScene = lazy(() => import("./MissionScene"));

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

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

/** Scroll ranges (0 → 1) for the DOM overlays that sit on top of the scene. */
const N = beats.length;
const slice = (i: number) => [i / N, (i + 1) / N] as const;
const inBeat = (b: number, i: number) => b === i;

/**
 * The homepage mission flight. One tall scroll track drives one sticky scene:
 * scroll position is the mission timeline, from a wide California establishing
 * shot through detection, the Operations Center, the UAV investigation and the
 * full-system reveal. Falls back to a layered 2D presentation on mobile,
 * reduced-motion, or without WebGL.
 */
export function MissionJourney() {
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef({ current: 0 });
  const hud = useRef<HTMLDivElement>(null);
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

      const idx = Math.min(N - 1, Math.floor(p * N * 0.999));
      setBeat((b) => (b === idx ? b : idx));
      if (hud.current) {
        const o = p > 0.03 ? 1 : 0;
        if (hud.current.style.opacity !== String(o)) hud.current.style.opacity = String(o);
      }
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

  const opsActive = beat === 6 || beat === 7;
  const rgbActive = beat === 9;
  const thermalActive = beat === 10;
  const mapActive = beat === 11 || beat === 12;
  const sensorView = rgbActive || thermalActive;

  return (
    <section
      ref={track}
      className="relative bg-[#1a1d22]"
      style={{ height: `${N * 92}vh` }}
      aria-label="Mission journey: from sensor detection to responder"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 3D scene — the visual spine of the page */}
        <div
          className="absolute inset-0 transition-[filter] duration-700 ease-out"
          style={{
            filter: thermalActive
              ? "grayscale(1) contrast(1.45) brightness(0.95) sepia(1) hue-rotate(185deg) saturate(3.2)"
              : "none",
          }}
        >
          {enabled ? (
            <Suspense fallback={null}>
              <MissionScene progress={progress.current} />
            </Suspense>
          ) : null}
        </div>

        {/* thermal heat wash */}
        <div
          className="journey-thermal pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{ opacity: thermalActive ? 0.55 : 0 }}
          aria-hidden
        />

        {/* atmospheric grade + legibility scrim */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(9,12,17,0.78) 0%, rgba(9,12,17,0.42) 30%, rgba(9,12,17,0.02) 54%, transparent 72%), radial-gradient(150% 105% at 60% 42%, transparent 58%, rgba(6,9,13,0.5) 100%)",
          }}
          aria-hidden
        />

        {/* aircraft sensor perspective framing */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{ opacity: sensorView ? 1 : 0 }}
          aria-hidden
        >
          <div className="scanlines absolute inset-0 opacity-40" />
          <div className="absolute inset-x-10 inset-y-8 border border-white/25">
            <span className="absolute -left-px -top-px h-5 w-5 border-l-2 border-t-2 border-[var(--signal)]" />
            <span className="absolute -right-px -top-px h-5 w-5 border-r-2 border-t-2 border-[var(--signal)]" />
            <span className="absolute -bottom-px -left-px h-5 w-5 border-b-2 border-l-2 border-[var(--signal)]" />
            <span className="absolute -bottom-px -right-px h-5 w-5 border-b-2 border-r-2 border-[var(--signal)]" />
          </div>
          <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2">
            <span className="absolute inset-0 rounded-full border border-[var(--signal)]/70" />
            <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-[var(--signal)]/70" />
            <span className="absolute bottom-0 left-1/2 h-4 w-px -translate-x-1/2 bg-[var(--signal)]/70" />
            <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-[var(--signal)]/70" />
            <span className="absolute right-0 top-1/2 h-px w-4 -translate-y-1/2 bg-[var(--signal)]/70" />
          </div>
          <p className="absolute left-12 top-12 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-white/70">
            UAV-01 · {thermalActive ? "Thermal (LWIR) · concept" : "Optical · concept"}
          </p>
          <p className="absolute right-12 top-12 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-white/70">
            Sensor feed · simulated
          </p>
        </div>

        {/* Operations Center — a live mission surface, not a static card */}
        <div
          className="pointer-events-none absolute inset-0 hidden transition-opacity duration-500 lg:block"
          style={{ opacity: opsActive ? 1 : 0 }}
          aria-hidden={!opsActive}
        >
          <div className="absolute inset-x-0 bottom-0 top-0 bg-[rgba(8,11,16,0.55)]" />
          <div className="absolute right-8 top-1/2 w-[26rem] -translate-y-1/2 border border-white/15 bg-[rgba(10,14,20,0.82)] backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/12 px-4 py-2.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white/70">
              <span className="flex items-center gap-2">
                <span className="live-pulse h-1.5 w-1.5 rounded-full bg-[var(--signal)]" />
                Operations Center · 24/7/365
              </span>
              <span>Concept</span>
            </div>
            <dl className="grid grid-cols-2 gap-px bg-white/10 font-mono text-[0.6rem] uppercase tracking-[0.16em]">
              {[
                ["Incident", "INC-0001 · Open"],
                ["Source", "Sensor node · corroborated"],
                ["Terrain", "Ridge · limited access"],
                ["Conditions", "Dry · wind rising"],
                ["Asset", beat === 7 ? "UAV-01 · Launching" : "UAV-01 · Standby"],
                ["Status", beat === 7 ? "Mission assigned" : "Under review"],
              ].map(([k, v]) => (
                <div key={k} className="bg-[rgba(10,14,20,0.95)] px-4 py-3">
                  <dt className="text-white/45">{k}</dt>
                  <dd className="mt-1.5 text-white/85">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="space-y-2 border-t border-white/12 px-4 py-3 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white/60">
              {[
                "Node reports anomaly",
                "Neighbours corroborate",
                "Operator reviews detection",
                "Incident opened",
                "Aircraft assigned",
              ].map((step, i) => {
                const done = beat === 7 ? i <= 4 : i <= 3;
                return (
                  <p key={step} className="flex items-center gap-2.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: done ? "var(--signal)" : "rgba(255,255,255,0.2)" }}
                    />
                    <span style={{ color: done ? "rgba(255,255,255,0.85)" : undefined }}>{step}</span>
                  </p>
                );
              })}
            </div>
          </div>
        </div>

        {/* Intelligence / mapping readout */}
        <div
          className="pointer-events-none absolute right-8 top-1/2 hidden w-[22rem] -translate-y-1/2 border border-white/15 bg-[rgba(10,14,20,0.78)] backdrop-blur-sm transition-opacity duration-500 lg:block"
          style={{ opacity: mapActive ? 1 : 0 }}
          aria-hidden
        >
          <p className="border-b border-white/12 px-4 py-2.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white/70">
            Incident record · concept
          </p>
          <dl className="grid gap-px bg-white/10 font-mono text-[0.6rem] uppercase tracking-[0.16em]">
            {[
              ["Position", "Locked · coordinates returned"],
              ["Optical", "Terrain + access captured"],
              ["Thermal", "Heat signature mapped"],
              ["Handoff", "Shared with responding agency"],
            ].map(([k, v]) => (
              <div key={k} className="bg-[rgba(10,14,20,0.95)] px-4 py-3">
                <dt className="text-white/45">{k}</dt>
                <dd className="mt-1.5 text-white/85">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* HUD frame */}
        <div
          ref={hud}
          className="pointer-events-none absolute inset-0 hidden font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/55 transition-opacity duration-500 lg:block"
          style={{ opacity: 0 }}
          aria-hidden
        >
          <div className="absolute left-6 top-24 flex items-center gap-2">
            <span className="live-pulse h-1.5 w-1.5 rounded-full bg-[var(--signal)]" />
            Mission 01 · Wildfire · Concept simulation
          </div>
          <div className="absolute right-6 top-24 space-y-1.5 text-right">
            <p>UAV-01 · {beat >= 7 ? "Airborne · on mission" : "Airborne · patrol"}</p>
            <p>Network · {beat >= 2 ? "Nodes reporting" : "Initialising"}</p>
            <p>Ops center · 24/7/365</p>
          </div>
          <div className="absolute bottom-8 left-6 right-6 flex items-center gap-1.5">
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

              {beat === N - 1 ? (
                <div className="pointer-events-auto mt-9 flex flex-wrap gap-3">
                  <Link
                    to="/system"
                    className="border border-white/25 px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/80 transition-colors hover:border-white/60 hover:text-white"
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
