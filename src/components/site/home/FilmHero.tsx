import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import californiaFlight from "@/assets/journey-california-flight.mp4.asset.json";
import ridge from "@/assets/j-ridge.jpg";
import { brand } from "@/config/brand";

/** Full-bleed film opener — the only video on the page. */
export function FilmHero() {
  const inner = useRef<HTMLDivElement>(null);

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
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={ridge}
        >
          <source src={californiaFlight.url} type="video/mp4" />
        </video>
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
    </section>
  );
}
