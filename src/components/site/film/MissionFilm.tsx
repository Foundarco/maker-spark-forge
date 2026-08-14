import { ClientOnly, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { shots, systemChain } from "@/config/mission-film";
import { JourneyFallback } from "@/components/site/journey/JourneyFallback";
import californiaFlight from "@/assets/journey-california-flight.mp4.asset.json";
import incidentFlight from "@/assets/journey-incident-flight.mp4.asset.json";
import california from "@/assets/f-california.jpg";
import opsmap from "@/assets/f-opsmap.jpg";
import suppressionPlate from "@/assets/f-suppression.jpg";
import reassessPlate from "@/assets/f-reassess.jpg";
import canyon from "@/assets/j-canyon.jpg";
import fire from "@/assets/j-fire.jpg";
import responders from "@/assets/j-responders.jpg";

const FilmAircraft = lazy(() => import("./FilmAircraft"));

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (v: number) => {
  const x = clamp(v);
  return x * x * (3 - 2 * x);
};
const win = (p: number, a: number, b: number, c: number, d: number) =>
  ease((p - a) / Math.max(0.001, b - a)) * (1 - ease((p - c) / Math.max(0.001, d - c)));

type Plate = {
  el: HTMLDivElement | null;
  a: number;
  b: number;
  c: number;
  d: number;
  /** parallax travel in % across the plate's life */
  drift: number;
  /** how much the plate pushes in */
  push: number;
};

/**
 * The public cinematic film.
 *
 * One rAF loop reads scroll once per frame and drives a velocity-aware spring.
 * Everything else — plates, overlays, copy, WebGL — reads that single value via
 * refs and CSS custom properties, so scrolling never triggers a React render.
 */
export function MissionFilm() {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const plates = useRef<Plate[]>([]);
  const chapters = useRef<(HTMLDivElement | null)[]>([]);
  const bar = useRef<HTMLSpanElement>(null);
  const progress = useRef(0);
  const velocity = useRef(0);
  const active = useRef(true);
  const [mode, setMode] = useState<"pending" | "film" | "reduced">("pending");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 760px)");
    const update = () => setMode(reduce.matches || small.matches ? "reduced" : "film");
    update();
    console.log("FILM mode init", reduce.matches, small.matches);
    reduce.addEventListener("change", update);
    small.addEventListener("change", update);
    return () => {
      reduce.removeEventListener("change", update);
      small.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (mode !== "film") return;
    const root = track.current;
    if (!root) return;

    const io = new IntersectionObserver(([entry]) => {
      active.current = entry?.isIntersecting ?? false;
    });
    io.observe(root);

    let frame = 0;
    let last = performance.now();
    let dominant = -1;

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!active.current) return;

      // ── scroll read (once) ───────────────────────────────────────────
      const rect = root.getBoundingClientRect();
      const span = root.offsetHeight - window.innerHeight;
      const target = clamp(-rect.top / Math.max(1, span));

      // ── velocity-aware spring: the scroll cues the film, the film carries
      const delta = target - progress.current;
      const stiffness = 46 + Math.min(70, Math.abs(delta) * 320);
      velocity.current += delta * stiffness * dt;
      velocity.current *= Math.exp(-9.5 * dt);
      progress.current += velocity.current * dt;
      if (Math.abs(delta) < 0.00004 && Math.abs(velocity.current) < 0.0004) {
        progress.current = target;
        velocity.current = 0;
      }
      const p = clamp(progress.current);
      const t = now / 1000;

      // ── batched writes ──────────────────────────────────────────────
      const s = stage.current;
      if (s) {
        s.style.setProperty("--p", p.toFixed(4));
        s.style.setProperty("--t", (t % 1000).toFixed(2));
        s.style.setProperty("--net", win(p, 0.10, 0.16, 0.26, 0.33).toFixed(3));
        s.style.setProperty("--alert", win(p, 0.20, 0.26, 0.33, 0.39).toFixed(3));
        s.style.setProperty("--map", win(p, 0.30, 0.36, 0.44, 0.49).toFixed(3));
        s.style.setProperty("--reticle", win(p, 0.53, 0.58, 0.80, 0.86).toFixed(3));
        s.style.setProperty("--thermal", win(p, 0.60, 0.655, 0.86, 0.90).toFixed(3));
        s.style.setProperty("--confirm", win(p, 0.67, 0.70, 0.86, 0.90).toFixed(3));
        s.style.setProperty("--water", win(p, 0.745, 0.785, 0.815, 0.845).toFixed(3));
        s.style.setProperty("--scan", win(p, 0.815, 0.85, 0.885, 0.91).toFixed(3));
        s.style.setProperty("--reveal", ease((p - 0.93) / 0.05).toFixed(3));
        s.style.setProperty("--vel", Math.min(1, Math.abs(velocity.current) * 6).toFixed(3));
      }
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;

      for (const plate of plates.current) {
        if (!plate?.el) continue;
        const o = win(p, plate.a, plate.b, plate.c, plate.d);
        plate.el.style.opacity = o.toFixed(3);
        plate.el.style.visibility = o < 0.004 ? "hidden" : "visible";
        if (o < 0.004) continue;
        const local = clamp((p - plate.a) / Math.max(0.001, plate.d - plate.a));
        const x = (local - 0.5) * plate.drift + Math.sin(t * 0.16) * 0.5;
        const y = (local - 0.5) * -plate.drift * 0.3;
        const scale = 1.1 - local * plate.push + Math.sin(t * 0.13) * 0.004;
        plate.el.style.transform = `translate3d(${x.toFixed(2)}%, ${y.toFixed(2)}%, 0) scale(${scale.toFixed(4)})`;
      }

      // ── chapter copy with hysteresis so small reversals don't flicker ──
      let next = dominant;
      for (let i = 0; i < shots.length; i += 1) {
        const at = shots[i]?.at ?? 0;
        const nextAt = shots[i + 1]?.at ?? 1.2;
        const mid = (at + nextAt) / 2;
        if (p >= at - (i === dominant ? -0.008 : 0.004) && p < mid + 0.012) next = i;
      }
      if (next !== dominant) dominant = next;

      for (let i = 0; i < shots.length; i += 1) {
        const el = chapters.current[i];
        const shot = shots[i];
        if (!el || !shot) continue;
        const prevAt = shots[i - 1]?.at;
        const nextAt = shots[i + 1]?.at;
        const enter = prevAt === undefined ? -0.03 : (prevAt + shot.at) / 2;
        const gone = nextAt === undefined ? 1.06 : (shot.at + nextAt) / 2;
        const fade = Math.min(0.016, (gone - enter) * 0.28);
        const o = win(p, enter, enter + fade, gone - fade, gone);
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
        el.style.pointerEvents = o > 0.7 ? "auto" : "none";
        const local = clamp((p - enter) / Math.max(0.001, gone - enter));
        el.style.transform = `translate3d(0, ${((0.5 - local) * 38).toFixed(1)}px, 0)`;
      }
    };

    frame = requestAnimationFrame(loop);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [mode]);

  const plate =
    (i: number, cfg: Omit<Plate, "el">) =>
    (el: HTMLDivElement | null) => {
      plates.current[i] = { el, ...cfg };
    };

  if (mode === "reduced") return <JourneyFallback />;

  if (mode === "pending") {
    return (
      <section className="relative h-[92svh] overflow-hidden bg-[var(--night)]">
        <img
          src={california}
          alt="California foothill ridgelines at dawn"
          className="h-full w-full object-cover"
          width={1920}
          height={1080}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--night),transparent_72%)]" />
      </section>
    );
  }

  return (
    <section
      ref={track}
      className="relative h-[1500vh] bg-[var(--night)]"
      aria-label="Mission 01 — autonomous wildfire detection, investigation and suppression development"
    >
      <div ref={stage} className="film-stage sticky top-0 h-svh overflow-hidden bg-[var(--night)]">
        {/* ── plates: real places, overlapping, never hard-cut ───────── */}
        <div ref={plate(0, { a: -0.06, b: -0.02, c: 0.05, d: 0.12, drift: 5, push: 0.07 })} className="film-plate">
          <img src={california} alt="California foothill ridgelines at dawn" className="film-media" width={1920} height={1080} fetchPriority="high" />
        </div>
        <div ref={plate(1, { a: 0.03, b: 0.09, c: 0.17, d: 0.24, drift: 6, push: 0.06 })} className="film-plate">
          <video className="film-media" autoPlay muted loop playsInline preload="metadata" poster={california}>
            <source src={californiaFlight.url} type="video/mp4" />
          </video>
        </div>
        <div ref={plate(2, { a: 0.15, b: 0.21, c: 0.30, d: 0.37, drift: -6, push: 0.05 })} className="film-plate">
          <img src={canyon} alt="" className="film-media" loading="lazy" />
        </div>
        <div ref={plate(3, { a: 0.30, b: 0.36, c: 0.43, d: 0.49, drift: 3, push: 0.04 })} className="film-plate">
          <img src={opsmap} alt="" className="film-media" loading="lazy" />
        </div>
        <div ref={plate(4, { a: 0.44, b: 0.49, c: 0.55, d: 0.60, drift: -7, push: 0.07 })} className="film-plate">
          <video className="film-media" autoPlay muted loop playsInline preload="none" poster={canyon}>
            <source src={incidentFlight.url} type="video/mp4" />
          </video>
        </div>
        {/* RGB and thermal are the SAME frame; the image transforms, it never swaps */}
        <div ref={plate(5, { a: 0.55, b: 0.60, c: 0.72, d: 0.78, drift: 4, push: 0.05 })} className="film-plate">
          <img src={fire} alt="" className="film-media" loading="lazy" />
          <div className="film-thermal" aria-hidden>
            <img src={fire} alt="" className="film-media" loading="lazy" />
          </div>
        </div>
        <div ref={plate(6, { a: 0.74, b: 0.785, c: 0.825, d: 0.865, drift: -4, push: 0.05 })} className="film-plate">
          <img src={suppressionPlate} alt="" className="film-media" loading="lazy" />
        </div>
        <div ref={plate(7, { a: 0.82, b: 0.855, c: 0.885, d: 0.925, drift: 4, push: 0.04 })} className="film-plate">
          <img src={reassessPlate} alt="" className="film-media" loading="lazy" />
        </div>
        <div ref={plate(8, { a: 0.88, b: 0.915, c: 0.94, d: 0.965, drift: -3, push: 0.04 })} className="film-plate">
          <img src={responders} alt="" className="film-media object-left" loading="lazy" />
        </div>
        <div ref={plate(9, { a: 0.94, b: 0.97, c: 1.06, d: 1.12, drift: 2, push: 0.03 })} className="film-plate">
          <img src={california} alt="" className="film-media" loading="lazy" />
        </div>

        <div className="film-grade" aria-hidden />

        {/* ── the protagonist ────────────────────────────────────────── */}
        <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
          <ClientOnly fallback={null}>
            <Suspense fallback={null}>
              <FilmAircraft progress={progress} active={active} />
            </Suspense>
          </ClientOnly>
        </div>

        {/* ── technical layers, each with its own life on the timeline ── */}
        <div className="film-net" aria-hidden>
          <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path d="M120 410 L285 250 L430 392 L620 210 L780 360 L900 226" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M190 186 L285 250 L500 150 L620 210 L860 120" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="film-node" style={{ left: `${11 + ((i * 17) % 78)}%`, top: `${26 + ((i * 29) % 50)}%`, animationDelay: `${i * -0.24}s` }} />
          ))}
        </div>
        <div className="film-alert" aria-hidden />
        <div className="film-map" aria-hidden>
          <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path className="film-route" d="M140 470 C 340 430, 470 300, 620 250" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <div className="film-reticle" aria-hidden>
          <span className="film-reticle-box" />
          <span className="film-reticle-h" />
          <span className="film-reticle-v" />
        </div>
        <div className="film-confirm" aria-hidden>
          <span>FIRE STATUS · CONFIRMED</span>
        </div>
        <div className="film-water" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="film-scan" aria-hidden />

        {/* ── copy: one kicker, one line, at most one sentence ───────── */}
        <div className="pointer-events-none absolute inset-0 z-30 mx-auto max-w-7xl px-5 sm:px-8">
          {shots.map((shot, i) => (
            <div
              key={shot.id}
              ref={(el) => {
                chapters.current[i] = el;
              }}
              className={`film-copy absolute inset-x-5 top-[20%] will-change-transform sm:inset-x-8 lg:top-1/2 lg:-translate-y-1/2 ${shot.align === "right" ? "lg:ml-auto lg:w-[46%]" : "lg:w-[50%]"}`}
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <div className="max-w-xl">
                <p
                  className={`flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.26em] ${shot.tone === "signal" ? "text-[var(--signal)]" : shot.tone === "data" ? "text-[var(--aid)]" : "text-ink/80"}`}
                >
                  <span>{shot.code}</span>
                  <span className="h-px w-9 bg-current" />
                  {shot.kicker}
                </p>
                {i === 0 ? (
                  <h1 className="display-cond mt-5 text-[clamp(3.4rem,8.6vw,7.4rem)] leading-[0.9] text-ink">{shot.title}</h1>
                ) : (
                  <h2 className="display-cond mt-5 text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.94] text-ink">{shot.title}</h2>
                )}
                {shot.line ? <p className="mt-4 max-w-md text-base leading-relaxed text-ink/85">{shot.line}</p> : null}
                {shot.note ? (
                  <p className="mt-3 max-w-md font-mono text-[0.6rem] uppercase leading-relaxed tracking-[0.14em] text-[var(--signal)]/85">
                    {shot.note}
                  </p>
                ) : null}
                {shot.telemetry ? (
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-ink/60">
                    {shot.telemetry.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                ) : null}
                {i === shots.length - 1 ? (
                  <div className="mt-6 flex flex-wrap gap-2 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-ink/70">
                    {systemChain.map((step) => (
                      <span key={step} className="border border-ink/20 px-3 py-1.5">
                        {step}
                      </span>
                    ))}
                  </div>
                ) : null}
                {i === 0 || i === shots.length - 1 ? (
                  <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
                    <Link to="/system" className="bg-[var(--signal)] px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--night)]">
                      Explore the system
                    </Link>
                    <Link to="/mission" className="border border-ink/35 bg-[var(--night)]/25 px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink backdrop-blur">
                      Our mission
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-px bg-ink/15" aria-hidden>
          <span ref={bar} className="block h-px w-full origin-left bg-[var(--signal)] will-change-transform" style={{ transform: "scaleX(0)" }} />
        </div>
        <div className="film-cue" aria-hidden>
          Scroll to fly the mission ↓
        </div>
      </div>
    </section>
  );
}
