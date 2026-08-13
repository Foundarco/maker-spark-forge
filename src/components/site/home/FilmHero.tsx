import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import californiaFlight from "@/assets/journey-california-flight.mp4.asset.json";
import incidentFlight from "@/assets/journey-incident-flight.mp4.asset.json";
import ridge from "@/assets/j-ridge.jpg";
import fire from "@/assets/j-fire.jpg";
import node from "@/assets/j-node.jpg";
import ops from "@/assets/j-ops.jpg";
import { brand } from "@/config/brand";

type Cut =
  | { kind: "video"; src: string; poster: string; label: string; hold: number }
  | { kind: "image"; src: string; label: string; hold: number };

/** Cut-scene reel: terrain → aircraft → fire → sensing → ops. */
const cuts: Cut[] = [
  { kind: "video", src: californiaFlight.url, poster: ridge, label: "Sierra ridgeline · dawn", hold: 6200 },
  { kind: "image", src: fire.src ?? (fire as unknown as string), label: "Ignition · unattended", hold: 3200 },
  { kind: "video", src: incidentFlight.url, poster: ops, label: "Aircraft en route", hold: 6200 },
  { kind: "image", src: node.src ?? (node as unknown as string), label: "Sensor node · ridge", hold: 3000 },
  { kind: "image", src: ops.src ?? (ops as unknown as string), label: "Operations Center · 24/7", hold: 3000 },
];

/** Full-bleed film opener — a cut-scene reel, the only video on the page. */
export function FilmHero() {
  const inner = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const cut = cuts[index];
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % cuts.length), cut?.hold ?? 4000);
    return () => window.clearTimeout(t);
  }, [index]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const el = inner.current;
      if (!el) return;
      const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
      el.style.transform = `translate3d(0, ${(p * 12).toFixed(2)}vh, 0) scale(${(1 + p * 0.08).toFixed(4)})`;
      el.style.opacity = (1 - p * 0.85).toFixed(3);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative h-[100svh] overflow-hidden bg-[var(--night)]">
      <div ref={inner} className="absolute inset-0 will-change-transform">
        {cuts.map((cut, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[900ms] ease-out"
            style={{ opacity: i === index ? 1 : 0 }}
            aria-hidden={i !== index}
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
                  animation: i === index ? "hero-drift 7s ease-out both" : undefined,
                }}
                loading={i > 1 ? "lazy" : "eager"}
              />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,22,0.55)_0%,rgba(6,12,22,0.12)_38%,rgba(6,12,22,0.85)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-6 pb-14 pt-36 sm:px-10">
        <h1 className="display-cond max-w-4xl animate-fade-in text-[clamp(4rem,13vw,11rem)] text-ink drop-shadow-[0_6px_40px_rgb(0_0_0/0.6)]">
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

      {/* Cut-scene index */}
      <div className="absolute bottom-6 right-6 z-10 hidden items-center gap-3 sm:flex sm:right-10">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink/70">
          {cuts[index]?.label}
        </span>
        <span className="flex items-center gap-1.5">
          {cuts.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show scene ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-all duration-500 ${i === index ? "w-8 bg-[var(--signal)]" : "w-3 bg-white/35 hover:bg-white/60"}`}
            />
          ))}
        </span>
      </div>
    </section>
  );
}
