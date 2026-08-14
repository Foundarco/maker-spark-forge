import { Link } from "@tanstack/react-router";
import { acts } from "@/config/acts";
import fire from "@/assets/act-fire.jpg";
import ridge from "@/assets/j-ridge.jpg";
import topo from "@/assets/act-topo.jpg";
import operator from "@/assets/act-operator.jpg";
import canyon from "@/assets/j-canyon.jpg";
import pov from "@/assets/act-pov.jpg";
import suppression from "@/assets/f-suppression.jpg";
import steam from "@/assets/act-steam.jpg";
import responders from "@/assets/act-responders.jpg";

/** Reduced-motion, small-screen and low-power presentation. Same twelve acts. */
const stills: Record<string, string> = {
  opening: fire,
  landscape: ridge,
  sense: topo,
  ops: operator,
  oversight: topo,
  navigate: canyon,
  investigate: pov,
  confirm: fire,
  suppress: suppression,
  reassess: steam,
  handoff: responders,
  system: ridge,
};

export function FilmFallback() {
  return (
    <div className="bg-[var(--night)]">
      {acts.map((act, i) => (
        <section
          key={act.id}
          aria-label={act.title}
          className={`relative isolate overflow-hidden border-b border-white/10 ${i === 0 ? "min-h-[88svh]" : "min-h-[60svh]"}`}
        >
          <img
            src={stills[act.id]}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-70"
            width={1920}
            height={1080}
            {...(i === 0 ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, rgba(6,10,18,0.86) 0%, rgba(6,10,18,0.4) 40%, transparent 74%)",
            }}
            aria-hidden
          />
          <div
            className={`relative mx-auto flex w-full max-w-7xl flex-col justify-end px-5 py-16 sm:px-8 ${i === 0 ? "min-h-[88svh]" : "min-h-[60svh]"}`}
          >
            <p className="act-kicker text-[var(--signal)]">
              <span>{act.code}</span>
              <span className="act-rule" />
              {act.kicker}
            </p>
            {i === 0 ? (
              <h1 className="display-cond mt-4 text-[clamp(2.8rem,12vw,5.5rem)] leading-[0.9] text-ink">
                {act.title}
              </h1>
            ) : (
              <h2 className="display-cond mt-4 text-[clamp(1.9rem,7vw,3.2rem)] leading-[0.94] text-ink">
                {act.title}
              </h2>
            )}
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink/75">{act.line}</p>
            {act.detail ? (
              <p className="mt-3 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-ink/55">
                {act.detail}
              </p>
            ) : null}
            {act.note ? (
              <p className="mt-3 max-w-md font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.14em] text-[var(--signal)]/85">
                {act.note}
              </p>
            ) : null}
            {i === 0 ? (
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/system"
                  className="bg-[var(--signal)] px-5 py-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--night)]"
                >
                  Explore the system
                </Link>
                <Link
                  to="/mission"
                  className="border border-ink/25 px-5 py-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink/85"
                >
                  Our mission
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}
