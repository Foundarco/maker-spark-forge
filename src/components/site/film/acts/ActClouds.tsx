import { useMemo, useRef } from "react";
import { Act } from "../Act";
import { act } from "@/config/acts";
import { uav } from "../uav";
import { ease } from "../useFilmScroll";

const copy = act("clouds");

const bands = [
  { top: 78, speed: 1.35, scale: 1.2, blur: 30 },
  { top: 58, speed: 0.95, scale: 1, blur: 40 },
  { top: 34, speed: 0.62, scale: 0.85, blur: 52 },
  { top: 12, speed: 0.38, scale: 0.7, blur: 60 },
];

/**
 * Act — the cloud break.
 *
 * The camera climbs through a cloud deck. This is where the film hands the
 * page over to daylight: the sky, the bands and the whole site brighten
 * together as the act scrubs.
 */
export function ActClouds() {
  const wrap = useRef<HTMLDivElement>(null);

  const frame = useMemo(
    () => (p: number) => {
      // the climb through the deck is what brings the daylight
      uav.lightBoost = ease(p * 1.15);
      const el = wrap.current;
      if (!el) return;
      const layers = el.querySelectorAll<HTMLElement>(".cloud-band");
      layers.forEach((band, i) => {
        const speed = bands[i]?.speed ?? 1;
        band.style.transform = `translate3d(0, ${(0.5 - p) * 120 * speed}vh, 0) scaleX(${bands[i]?.scale ?? 1})`;
      });
    },
    [],
  );

  return (
    <Act id="act-clouds" label={copy.title} vh={260} frame={frame} stageClassName="cloud-stage">
      <div ref={wrap} className="absolute inset-0">
        <div className="cloud-sky" aria-hidden />
        <div className="cloud-sun" aria-hidden />
        {bands.map((b, i) => (
          <span
            key={i}
            className="cloud-band"
            style={{ top: `${b.top}%`, filter: `blur(${b.blur}px)` }}
            aria-hidden
          />
        ))}

        <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-5 text-center">
          <p className="act-kicker justify-center text-[var(--signal)]">
            <span>{copy.code}</span>
            <span className="act-rule" />
            {copy.kicker}
          </p>
          <h2 className="display-cond mt-5 text-[clamp(3rem,10vw,7.5rem)] leading-[0.88] text-ink">
            {copy.title}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/75 sm:text-lg">{copy.line}</p>
        </div>
      </div>
    </Act>
  );
}
