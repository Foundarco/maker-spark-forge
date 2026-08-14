import { Link } from "@tanstack/react-router";
import { futureMissions } from "@/config/acts";
import { brand } from "@/config/brand";

/** Format: a plain page again. The film is over; this is the ask. */
export function ActFuture() {
  return (
    <section aria-label="Beyond Mission 01" className="relative bg-[var(--night)] px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="act-kicker text-ink/60">
          <span>13</span>
          <span className="act-rule" />
          Beyond Mission 01
        </p>
        <h2 className="display-cond mt-4 max-w-3xl text-[clamp(2rem,5vw,3.8rem)] leading-[0.95] text-ink">
          Wildfire is where we start.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/70">
          The same idea — sensors, autonomous aircraft and people making the calls — could serve other
          emergencies later. Wildfire comes first.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-ink/55">
          {futureMissions.map((m) => (
            <li key={m} className="border border-ink/15 px-3 py-1.5">
              {m}
            </li>
          ))}
        </ul>

        <div className="mt-16 border-t border-ink/12 pt-14">
          <h2 className="display-cond max-w-3xl text-[clamp(2.2rem,6vw,4.6rem)] leading-[0.92] text-ink">
            Build Mission 01 with us.
          </h2>
          <p className="mt-4 max-w-xl text-base text-ink/70">{brand.shortMission}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/donate"
              className="bg-[var(--signal)] px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--night)]"
            >
              Support the mission
            </Link>
            <Link
              to="/join"
              className="border border-ink/25 px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink"
            >
              Build with us
            </Link>
            <Link
              to="/partners"
              className="border border-ink/25 px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink"
            >
              Partner with us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
