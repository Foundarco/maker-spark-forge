import { useMemo } from "react";
import { Act } from "../Act";
import { act } from "@/config/acts";
import { uav } from "../uav";
import { clamp, ease, ramp } from "../useFilmScroll";

const copy = act("reveal");

const callouts = [
  { side: "l", top: 26, left: 8, text: "Thermal + RGB payload" },
  { side: "l", top: 52, left: 6, text: "Vertical takeoff, no runway" },
  { side: "r", top: 34, left: 74, text: "Fixed-wing cruise" },
  { side: "r", top: 62, left: 72, text: "Water payload bay" },
] as const;

/**
 * Act — the aircraft reveal.
 *
 * It climbs out of the cloud deck as a silhouette, daylight fills the
 * airframe, then it holds centre-frame and turns while the hardware
 * labels draw themselves in.
 */
export function ActReveal() {
  const frame = useMemo(
    () => (p: number) => {
      // present from the moment it breaks the deck, gone once we move on
      uav.weight = ease(ramp(p, 0.04, 0.3)) * (1 - ease(ramp(p, 0.88, 1)));
      uav.reveal = clamp(p);
      uav.lightBoost = 1;
      // hold it near the start of the transit so it reads as a hero shot
      uav.t = 0.06 + p * 0.1;
      uav.bank = Math.sin(p * Math.PI) * 0.12;
    },
    [],
  );

  return (
    <Act id="act-reveal" label={copy.title} vh={300} frame={frame}>
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--background) 92%, white) 0%, var(--background) 62%, color-mix(in oklab, var(--background) 88%, var(--signal)) 100%)",
          }}
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-between px-5 py-24 sm:px-8">
          <div>
            <p className="act-kicker text-[var(--signal)]">
              <span>{copy.code}</span>
              <span className="act-rule" />
              {copy.kicker}
            </p>
            <h2 className="display-cond mt-4 max-w-3xl text-[clamp(2.4rem,7vw,5.4rem)] leading-[0.9] text-ink">
              {copy.title}
            </h2>
          </div>

          {callouts.map((c, i) => (
            <span
              key={c.text}
              className="reveal-call"
              data-side={c.side}
              style={{ top: `${c.top}%`, left: `${c.left}%`, ["--d" as string]: i }}
              aria-hidden
            >
              {c.text}
            </span>
          ))}

          <div className="max-w-md">
            <p className="text-base leading-relaxed text-ink/78">{copy.line}</p>
            {copy.detail ? (
              <p className="mt-3 font-mono text-[0.56rem] uppercase tracking-[0.2em] text-[var(--signal)]">
                {copy.detail}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Act>
  );
}
