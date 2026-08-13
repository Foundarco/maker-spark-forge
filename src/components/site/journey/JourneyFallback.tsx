import { Link } from "@tanstack/react-router";
import { beats } from "@/config/journey";

/**
 * Reduced-motion / mobile / no-WebGL presentation of the mission journey.
 * Same narrative beats, delivered as a stacked cinematic sequence.
 */
export function JourneyFallback() {
  return (
    <section className="bg-[#0b0f14]" aria-label="Mission journey: from sensor detection to responder">
      {beats.map((b, i) => {
        const still = b.img;
        const tone = b.tone === "signal" ? "var(--signal)" : b.tone === "data" ? "#38bdf8" : "currentColor";
        return (
          <div
            key={b.id}
            className={`relative isolate overflow-hidden border-b border-white/10 ${
              i === 0 ? "min-h-[88vh]" : "min-h-[62vh]"
            }`}
          >
            {still ? (
              <img
                src={still}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover opacity-45"
                loading={i === 0 ? "eager" : "lazy"}
              />
            ) : null}
            <div className="scrim-full absolute inset-0" aria-hidden />
            <div className="blueprint-grid absolute inset-0 text-white/25" aria-hidden />
            <div
              className={`relative mx-auto flex w-full max-w-7xl flex-col justify-end px-5 py-16 sm:px-8 ${
                i === 0 ? "min-h-[88vh]" : "min-h-[62vh]"
              }`}
            >
              <p
                className="flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.26em]"
                style={{ color: tone }}
              >
                <span className="tabular-nums">{b.code}</span>
                <span className="h-px w-6" style={{ background: tone }} />
                {b.label}
              </p>
              <h2
                className={`display-cond mt-4 text-ink ${
                  i === 0 ? "text-[clamp(2.8rem,12vw,5.5rem)]" : "text-[clamp(1.9rem,7vw,3.2rem)]"
                }`}
              >
                {b.title}
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/75">{b.line}</p>
              {b.id === "network" ? (
                <div className="mt-6 max-w-md text-white/40">
                  <SensorNetwork className="aspect-[10/8]" />
                </div>
              ) : null}
              {i === 0 ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/system"
                    className="border border-[color:var(--signal)] bg-[var(--signal)] px-5 py-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#10131a]"
                  >
                    Explore the system
                  </Link>
                  <Link
                    to="/mission"
                    className="border border-white/25 px-5 py-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/80"
                  >
                    Our mission
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}
