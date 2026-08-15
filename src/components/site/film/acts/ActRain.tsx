import { useMemo, useRef } from "react";
import { Act } from "../Act";
import { act } from "@/config/acts";
import rainClip from "@/assets/reel-rain-ruins.mp4.asset.json";

const copy = act("rain");

/** deterministic pseudo-random so server and client render the same rain */
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  // rounded so server and client markup match exactly
  return Math.round((x - Math.floor(x)) * 1000) / 1000;
};

const drops = Array.from({ length: 64 }, (_, i) => ({
  left: rand(i, 1) * 100,
  dur: 0.75 + rand(i, 2) * 0.9,
  delay: rand(i, 3) * 2,
  len: rand(i, 4),
  op: 0.25 + rand(i, 5) * 0.75,
}));

/** where the rain freezes into the sensor network */
const nodes = [
  { x: 16, y: 66 },
  { x: 27, y: 41 },
  { x: 38, y: 73 },
  { x: 49, y: 33 },
  { x: 57, y: 61 },
  { x: 66, y: 45 },
  { x: 75, y: 70 },
  { x: 86, y: 39 },
];

/**
 * Act II — the rain.
 *
 * Cold rain over the ruins, then the drops slow, stop, and become the
 * sensor network reading the same ground.
 */
export function ActRain() {
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  const frame = useMemo(
    () => (p: number) => {
      const el = stage.current;
      if (el) el.style.setProperty("--slow", (1 + p * 5.5).toFixed(3));
      const v = video.current;
      if (v) {
        const want = p > 0.02 && p < 0.96;
        if (want && v.paused) void v.play().catch(() => {});
        if (!want && !v.paused) v.pause();
      }
    },
    [],
  );

  return (
    <Act id="act-rain" label={copy.title} vh={280} frame={frame} stageClassName="rain-stage">
      <div ref={stage} className="absolute inset-0" style={{ ["--slow" as string]: 1 }}>
        <video
          ref={video}
          className="rain-media"
          muted
          loop
          playsInline
          preload="none"
          aria-label="Rain falling on a burned neighbourhood, steam rising from the rubble"
        >
          <source src={rainClip.url} type="video/mp4" />
        </video>

        <div className="rain-field" aria-hidden>
          {drops.map((d, i) => (
            <span
              key={i}
              className="rain-drop"
              style={{
                left: `${d.left}%`,
                ["--dur" as string]: d.dur,
                ["--delay" as string]: d.delay,
                ["--len" as string]: d.len,
                ["--o" as string]: d.op,
              }}
            />
          ))}
        </div>

        <div className="rain-scrim" aria-hidden />

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="rain-mesh absolute inset-0 h-full w-full" aria-hidden>
          {nodes.slice(0, -1).map((n, i) => {
            const m = nodes[i + 1]!;
            return <line key={i} x1={n.x} y1={n.y} x2={m.x} y2={m.y} vectorEffect="non-scaling-stroke" />;
          })}
        </svg>

        {nodes.map((n, i) => (
          <span
            key={i}
            className="rain-ping"
            style={{ left: `${n.x}%`, top: `${n.y}%`, ["--d" as string]: i }}
            aria-hidden
          />
        ))}

        <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-5 text-center">
          <p className="act-kicker justify-center text-[var(--signal)]">
            <span>{copy.code}</span>
            <span className="act-rule" />
            {copy.kicker}
          </p>
          <h2 className="display-cond mt-5 text-[clamp(2.6rem,8vw,6rem)] leading-[0.9] text-ink">
            {copy.title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/75 sm:text-lg">{copy.line}</p>
          {copy.detail ? (
            <p className="mt-8 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-[var(--signal)]">
              {copy.detail}
            </p>
          ) : null}
        </div>
      </div>
    </Act>
  );
}
