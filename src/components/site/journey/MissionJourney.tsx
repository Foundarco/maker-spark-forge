import { ClientOnly, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { beats } from "@/config/journey";
import californiaFlight from "@/assets/journey-california-flight.mp4.asset.json";
import incidentFlight from "@/assets/journey-incident-flight.mp4.asset.json";
import ridge from "@/assets/j-ridge.jpg";
import node from "@/assets/j-node.jpg";
import ops from "@/assets/j-ops.jpg";
import responders from "@/assets/j-responders.jpg";
import system from "@/assets/j-system.jpg";
import { JourneyFallback } from "./JourneyFallback";

const MissionAircraftScene = lazy(() => import("./MissionAircraftScene"));
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value: number) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};
const windowed = (p: number, enter: number, full: number, leave: number, gone: number) =>
  smooth((p - enter) / Math.max(0.001, full - enter)) * (1 - smooth((p - leave) / Math.max(0.001, gone - leave)));

type Layer = {
  el: HTMLDivElement | null;
  enter: number;
  full: number;
  leave: number;
  gone: number;
  drift: number;
};

/** One master timeline drives media, aircraft, camera-adjacent graphics, and type. */
export function MissionJourney() {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const chapters = useRef<(HTMLDivElement | null)[]>([]);
  const layers = useRef<Layer[]>([]);
  const progressBar = useRef<HTMLSpanElement>(null);
  const progress = useRef(0);
  const active = useRef(true);
  const [motionMode, setMotionMode] = useState<"pending" | "full" | "reduced">("pending");

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 720px)");
    const update = () => setMotionMode(media.matches || narrow.matches ? "reduced" : "full");
    update();
    media.addEventListener("change", update);
    narrow.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      narrow.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (motionMode !== "full") return;
    const observer = new IntersectionObserver(([entry]) => {
      active.current = entry?.isIntersecting ?? false;
    });
    if (track.current) observer.observe(track.current);

    let frameId = 0;
    let previous = performance.now();
    let rendered = -1;
    const frame = (now: number) => {
      frameId = requestAnimationFrame(frame);
      if (!active.current) return;
      const root = track.current;
      if (!root) return;
      const dt = Math.min(0.05, (now - previous) / 1000);
      previous = now;
      const rect = root.getBoundingClientRect();
      const distance = root.offsetHeight - window.innerHeight;
      const target = clamp(-rect.top / Math.max(1, distance));
      progress.current += (target - progress.current) * (1 - Math.pow(0.00008, dt));
      if (Math.abs(target - progress.current) < 0.00002) progress.current = target;
      const p = progress.current;
      if (Math.abs(p - rendered) < 0.00002) return;
      rendered = p;

      if (stage.current) {
        stage.current.style.setProperty("--journey-progress", p.toFixed(5));
        const thermal = smooth((p - 0.73) / 0.07) * (1 - smooth((p - 0.87) / 0.055));
        stage.current.style.setProperty("--thermal", thermal.toFixed(4));
        stage.current.style.setProperty("--network", windowed(p, 0.11, 0.17, 0.29, 0.36).toFixed(4));
        stage.current.style.setProperty("--alert", windowed(p, 0.29, 0.34, 0.42, 0.48).toFixed(4));
        stage.current.style.setProperty("--intel", windowed(p, 0.75, 0.81, 0.93, 0.98).toFixed(4));
      }
      if (progressBar.current) progressBar.current.style.transform = `scaleX(${p.toFixed(5)})`;

      for (const layer of layers.current) {
        if (!layer.el) continue;
        const opacity = windowed(p, layer.enter, layer.full, layer.leave, layer.gone);
        const local = clamp((p - layer.enter) / Math.max(0.001, layer.gone - layer.enter));
        layer.el.style.opacity = opacity.toFixed(3);
        layer.el.style.visibility = opacity < 0.003 ? "hidden" : "visible";
        layer.el.style.transform = `translate3d(${((local - 0.5) * layer.drift).toFixed(2)}%, ${((local - 0.5) * -layer.drift * 0.28).toFixed(2)}%, 0) scale(${(1.09 - local * 0.055).toFixed(4)})`;
      }

      for (let i = 0; i < beats.length; i += 1) {
        const chapter = chapters.current[i];
        const beat = beats[i];
        if (!chapter || !beat) continue;
        const previousAt = beats[i - 1]?.at;
        const nextAt = beats[i + 1]?.at;
        const enter = previousAt === undefined ? -0.02 : (previousAt + beat.at) / 2;
        const gone = nextAt === undefined ? 1.04 : (beat.at + nextAt) / 2;
        const transition = Math.min(0.012, (gone - enter) * 0.16);
        const opacity = windowed(p, enter, enter + transition, gone - transition, gone);
        const offset = clamp((p - enter) / Math.max(0.001, gone - enter));
        chapter.style.opacity = opacity.toFixed(3);
        chapter.style.visibility = opacity < 0.008 ? "hidden" : "visible";
        chapter.style.pointerEvents = opacity > 0.65 ? "auto" : "none";
        chapter.style.transform = `translate3d(0, ${((0.5 - offset) * 44).toFixed(2)}px, 0) scale(${(0.97 + opacity * 0.03).toFixed(4)})`;
      }
    };
    frameId = requestAnimationFrame(frame);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [motionMode]);

  if (motionMode === "reduced") return <JourneyFallback />;

  if (motionMode === "pending") {
    return (
      <section className="relative h-[92vh] overflow-hidden bg-[var(--night)]">
        <img src={ridge} alt="California mountain ridgelines at dawn" className="h-full w-full object-cover" width={1600} height={900} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--night),transparent_70%)]" />
      </section>
    );
  }

  const registerLayer = (index: number, config: Omit<Layer, "el">) => (el: HTMLDivElement | null) => {
    layers.current[index] = { el, ...config };
  };

  return (
    <section ref={track} className="relative h-[1320vh] bg-[var(--night)]" aria-label="Mission 01: autonomous wildfire detection and investigation">
      <div ref={stage} className="journey-stage sticky top-0 h-screen overflow-hidden bg-[var(--night)]">
        {/* Fewer, longer-lived environments overlap beneath one persistent aircraft. */}
        <div ref={registerLayer(0, { enter: -0.05, full: 0, leave: 0.3, gone: 0.4, drift: 7 })} className="journey-environment absolute inset-0">
          <video className="h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={ridge}>
            <source src={californiaFlight.url} type="video/mp4" />
          </video>
        </div>
        <div ref={registerLayer(1, { enter: 0.12, full: 0.19, leave: 0.3, gone: 0.36, drift: -5 })} className="journey-environment absolute inset-0 mix-blend-screen">
          <img src={node} alt="" className="h-full w-full object-cover opacity-30" />
        </div>
        <div ref={registerLayer(2, { enter: 0.32, full: 0.4, leave: 0.51, gone: 0.6, drift: 3 })} className="journey-environment absolute inset-0">
          <img src={ops} alt="" className="h-full w-full object-cover" />
        </div>
        <div ref={registerLayer(3, { enter: 0.5, full: 0.59, leave: 0.87, gone: 0.94, drift: -7 })} className="journey-environment absolute inset-0">
          <video className="h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={system}>
            <source src={incidentFlight.url} type="video/mp4" />
          </video>
        </div>
        <div ref={registerLayer(4, { enter: 0.86, full: 0.91, leave: 0.955, gone: 0.995, drift: 4 })} className="journey-environment absolute inset-0">
          <img src={responders} alt="" className="h-full w-full object-cover object-left" />
          <div className="absolute inset-0 bg-[var(--night)]/35" aria-hidden />
        </div>
        <div ref={registerLayer(5, { enter: 0.94, full: 0.975, leave: 1.05, gone: 1.1, drift: -3 })} className="journey-environment absolute inset-0">
          <img src={system} alt="" className="h-full w-full object-cover" />
        </div>

        <div className="journey-grade pointer-events-none absolute inset-0" aria-hidden />
        <div className="journey-thermal-pass pointer-events-none absolute inset-0" aria-hidden />
        <div className="journey-grid pointer-events-none absolute inset-0" aria-hidden />

        <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden>
          <ClientOnly fallback={null}>
            <Suspense fallback={null}>
              <MissionAircraftScene progress={progress} active={active} />
            </Suspense>
          </ClientOnly>
        </div>

        {/* Sensor mesh grows out of terrain, then collapses into the alert/ops map. */}
        <div className="journey-network pointer-events-none absolute inset-0 z-20" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="journey-node" style={{ left: `${12 + ((i * 19) % 76)}%`, top: `${27 + ((i * 23) % 48)}%`, animationDelay: `${i * -0.22}s` }} />
          ))}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
            <path d="M120 410 L285 240 L430 390 L620 205 L780 360 L900 220" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M190 180 L285 240 L500 145 L620 205 L860 115" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        <div className="journey-alert-ring pointer-events-none absolute left-[54%] top-[55%] z-20 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full" aria-hidden />
        <div className="journey-reticle pointer-events-none absolute inset-0 z-20" aria-hidden>
          <span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 border border-current" />
          <span className="absolute left-1/2 top-1/2 h-px w-44 -translate-x-1/2 bg-current" />
          <span className="absolute left-1/2 top-1/2 h-44 w-px -translate-y-1/2 bg-current" />
        </div>

        <div className="pointer-events-none absolute inset-0 z-30 mx-auto max-w-7xl px-5 sm:px-8">
          {beats.map((beat, index) => (
            <div
              key={beat.id}
              ref={(el) => { chapters.current[index] = el; }}
              className={`journey-copy absolute inset-x-5 top-[19%] will-change-transform sm:inset-x-8 lg:top-1/2 lg:-translate-y-1/2 ${beat.align === "right" ? "lg:ml-auto lg:w-[48%]" : "lg:w-[52%]"}`}
              style={{ opacity: index === 0 ? 1 : 0 }}
            >
              <div className="max-w-xl">
                <p className={`journey-kicker flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.24em] ${beat.tone === "signal" ? "text-[var(--signal)]" : beat.tone === "data" ? "text-[var(--aid)]" : "text-foreground/80"}`}>
                  <span>{beat.code}</span><span className="h-px w-9 bg-current" />{beat.label}
                </p>
                <h1 className={`${index === 0 ? "block" : "hidden"} display-cond mt-5 max-w-3xl text-[clamp(3.5rem,9vw,7.8rem)] text-ink drop-shadow-[0_4px_26px_rgb(0_0_0/0.55)]`}>{beat.title}</h1>
                {index > 0 ? <h2 className="display-cond mt-5 max-w-2xl text-[clamp(2.5rem,5.2vw,4.8rem)] text-ink drop-shadow-[0_4px_26px_rgb(0_0_0/0.55)]">{beat.title}</h2> : null}
                <p className="mt-5 max-w-lg text-base leading-relaxed text-foreground/85 sm:text-lg">{beat.line}</p>
                {beat.telemetry ? (
                  <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-foreground/65">
                    {beat.telemetry.map((item) => <span key={item}>{item}</span>)}
                  </div>
                ) : null}
                {index === 0 ? (
                  <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
                    <Link to="/system" className="bg-[var(--signal)] px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--night)]">Explore the system</Link>
                    <Link to="/mission" className="border border-foreground/35 bg-[var(--night)]/25 px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-foreground backdrop-blur">Our mission</Link>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-px bg-foreground/15" aria-hidden>
          <span ref={progressBar} className="block h-px w-full origin-left bg-[var(--signal)] will-change-transform" style={{ transform: "scaleX(0)" }} />
        </div>
        <div className="journey-scroll-cue pointer-events-none absolute inset-x-0 bottom-6 z-40 text-center font-mono text-[0.58rem] uppercase tracking-[0.26em] text-foreground/65" aria-hidden>
          Enter the mission ↓
        </div>
      </div>
    </section>
  );
}