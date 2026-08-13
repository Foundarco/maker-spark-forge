import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import californiaFlight from "@/assets/journey-california-flight.mp4.asset.json";
import incidentFlight from "@/assets/journey-incident-flight.mp4.asset.json";
import ridge from "@/assets/j-ridge.jpg";
import fire from "@/assets/j-fire.jpg";
import node from "@/assets/j-node.jpg";
import ops from "@/assets/j-ops.jpg";
import canyon from "@/assets/j-canyon.jpg";
import responders from "@/assets/j-responders.jpg";
import { brand } from "@/config/brand";

type Cut =
  | { kind: "video"; src: string; poster: string; hold: number }
  | { kind: "image"; src: string; hold: number; from: string; to: string };

/**
 * Continuous cut-scene reel, cinema style: hard-ish cuts, always moving,
 * no chrome over the film — the headline is the only thing that stays.
 */
const cuts: Cut[] = [
  { kind: "video", src: californiaFlight.url, poster: ridge, hold: 5200 },
  { kind: "image", src: fire, hold: 2400, from: "scale(1.22) translate3d(3%,2%,0)", to: "scale(1.04) translate3d(-1%,0,0)" },
  { kind: "video", src: incidentFlight.url, poster: canyon, hold: 5200 },
  { kind: "image", src: node, hold: 2400, from: "scale(1.05) translate3d(-3%,0,0)", to: "scale(1.24) translate3d(2%,-2%,0)" },
  { kind: "image", src: canyon, hold: 2400, from: "scale(1.2) translate3d(0,-3%,0)", to: "scale(1.02) translate3d(0,1%,0)" },
  { kind: "image", src: ops, hold: 2400, from: "scale(1.02) translate3d(2%,0,0)", to: "scale(1.2) translate3d(-2%,-1%,0)" },
  { kind: "image", src: responders, hold: 2400, from: "scale(1.18) translate3d(-2%,1%,0)", to: "scale(1.02) translate3d(1%,0,0)" },
];

export function FilmHero() {
  const inner = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(
      () => setIndex((i) => (i + 1) % cuts.length),
      cuts[index]?.hold ?? 3200,
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
        inner.current.style.filter = `brightness(${(1 - p * 0.45).toFixed(3)})`;
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
          return (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-[420ms] ease-linear"
              style={{ opacity: active ? 1 : 0 }}
              aria-hidden={!active}
            >
              {cut.kind === "video" ? (
                <video
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload={i === 0 ? "auto" : "metadata"}
                  poster={cut.poster}
                >
                  <source src={cut.src} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={cut.src}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{
                    transform: active ? cut.to : cut.from,
                    transition: active ? `transform ${cut.hold + 900}ms linear` : "none",
                  }}
                  loading={i > 1 ? "lazy" : "eager"}
                />
              )}
            </div>
          );
        })}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,22,0.5)_0%,rgba(6,12,22,0.08)_40%,rgba(6,12,22,0.88)_100%)]" />
      </div>

      <div
        ref={copy}
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-6 pb-16 pt-36 will-change-transform sm:px-10"
      >
        <h1 className="display-cond max-w-4xl animate-fade-in text-[clamp(4rem,13vw,11rem)] leading-[0.86] text-ink drop-shadow-[0_6px_40px_rgb(0_0_0/0.6)]">
          See it sooner
        </h1>

        <div className="max-w-xl">
          <p className="text-xl leading-snug text-ink/90 sm:text-2xl">
            Autonomous wildfire detection. Investigated from the air in minutes, not hours.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/mission"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-[var(--night)] transition-transform hover:scale-[1.03]"
            >
              Our mission
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-ink/80">
              <span className="live-pulse h-1.5 w-1.5 rounded-full bg-[var(--signal)]" aria-hidden />
              {brand.status}
            </span>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
        <span className="h-10 w-px overflow-hidden bg-white/20">
          <span className="block h-4 w-px animate-[cue_2.2s_ease-in-out_infinite] bg-[var(--signal)]" />
        </span>
      </div>
    </section>
  );
}
