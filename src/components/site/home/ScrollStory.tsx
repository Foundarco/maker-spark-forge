import { useEffect, useRef } from "react";
import { CountUp } from "@/components/site/CountUp";
import sensor from "@/assets/wf-sensor.jpg";
import transit from "@/assets/j-transit.jpg";
import ops from "@/assets/j-ops.jpg";
import fire from "@/assets/j-fire.jpg";

const chapters = [
  {
    img: sensor,
    alt: "Field sensor node mounted on a ridge",
    kicker: "01 — Sense",
    title: ["Eyes", "on the ridge"],
    body: "Low-power sensor nodes watch heat, smoke and wind across terrain where nobody is looking, and stay awake when the network is thin.",
    stat: ["< 60s", "signal to Operations Center"],
  },
  {
    img: fire,
    alt: "Early ignition in dry brush",
    kicker: "02 — Detect",
    title: ["A maybe", "becomes a mission"],
    body: "Signals are correlated across nodes, weather and terrain. When the pattern holds, an investigation launches automatically.",
    stat: ["24/7/365", "autonomous watch"],
  },
  {
    img: transit,
    alt: "Autonomous aircraft in transit above foothills",
    kicker: "03 — Investigate",
    title: ["Airborne", "in minutes"],
    body: "The aircraft flies itself to the coordinate and turns a maybe into a look — optical for context, thermal for what smoke hides.",
    stat: ["RGB + IR", "on one airframe"],
  },
  {
    img: ops,
    alt: "Operations Center console with live incident map",
    kicker: "04 — Inform",
    title: ["Answers,", "not alarms"],
    body: "Responders get position, spread and access — the picture they need to decide, while the fire is still small enough to matter.",
    stat: ["One picture", "shared by everyone"],
  },
] as const;

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/**
 * Scroll-locked chapter stack. The stage pins to the viewport and each chapter
 * flies in / out as scroll progress advances through the tall track.
 */
export function ScrollStory() {
  const track = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const plates = useRef<(HTMLDivElement | null)[]>([]);
  const marks = useRef<(HTMLSpanElement | null)[]>([]);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    let smoothed = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const root = track.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const distance = root.offsetHeight - window.innerHeight;
      const target = clamp(-rect.top / Math.max(1, distance));
      smoothed += (target - smoothed) * 0.16;
      const p = smoothed * chapters.length;

      if (bar.current) bar.current.style.transform = `scaleX(${smoothed.toFixed(4)})`;

      chapters.forEach((_, i) => {
        const local = p - i; // 0 → 1 while this chapter owns the stage
        // Plates cross-dissolve slowly; copy swaps quickly so two chapters
        // never read on top of each other.
        const plateIn = clamp(local / 0.45);
        const plateOut = clamp((local - 0.85) / 0.35);
        const plateOpacity = plateIn * (1 - plateOut);
        const textIn = clamp((local - 0.06) / 0.24);
        const textOut = clamp((local - 0.82) / 0.16);
        const opacity = textIn * (1 - textOut);
        const panel = panels.current[i];
        const plate = plates.current[i];
        if (panel) {
          panel.style.opacity = opacity.toFixed(3);
          panel.style.visibility = opacity < 0.01 ? "hidden" : "visible";
          panel.style.transform = `translate3d(0, ${((1 - textIn) * 70 - textOut * 60).toFixed(1)}px, 0)`;
        }
        if (plate) {
          plate.style.opacity = plateOpacity.toFixed(3);
          plate.style.visibility = plateOpacity < 0.01 ? "hidden" : "visible";
          plate.style.transform = `translate3d(${((1 - plateIn) * 8 - plateOut * 8).toFixed(2)}%, 0, 0) scale(${(1.06 - plateIn * 0.05 + plateOut * 0.04).toFixed(4)})`;
        }
        const mark = marks.current[i];
        if (mark) {
          mark.style.opacity = (0.28 + opacity * 0.72).toFixed(3);
          mark.style.transform = `scaleX(${(0.35 + opacity * 0.65).toFixed(3)})`;
        }
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      ref={track}
      className="relative bg-[oklch(0.97_0.012_95)] text-[oklch(0.16_0.02_260)]"
      style={{ height: `${(chapters.length + 1) * 100}vh` }}
      aria-label="How the system works"
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 sm:px-10 lg:grid-cols-2 lg:gap-16">
          {/* Copy stack */}
          <div className="relative order-2 h-[46svh] lg:order-1 lg:h-[62vh]">
            {chapters.map((c, i) => (
              <div
                key={c.kicker}
                ref={(el) => { panels.current[i] = el; }}
                className="absolute inset-0 flex flex-col justify-center will-change-transform"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[oklch(0.5_0.02_260)]">
                  {c.kicker}
                </p>
                <h3 className="display-cond mt-4 text-[clamp(2.4rem,6vw,5.4rem)] leading-[0.88] text-[oklch(0.12_0.02_260)]">
                  {c.title[0]}
                  <span className="block">{c.title[1]}</span>
                </h3>
                <p className="mt-5 max-w-md text-base leading-relaxed text-[oklch(0.36_0.02_260)] sm:text-lg">
                  {c.body}
                </p>
                <p className="mt-6 flex items-baseline gap-3">
                  <span className="display-cond text-3xl text-[oklch(0.12_0.02_260)]">
                    {/[0-9]/.test(c.stat[0]) && !c.stat[0].includes("/") ? (
                      <CountUp value={c.stat[0]} />
                    ) : (
                      c.stat[0]
                    )}
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-[oklch(0.5_0.02_260)]">{c.stat[1]}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Media stack */}
          <div className="relative order-1 h-[38svh] overflow-hidden rounded-3xl lg:order-2 lg:h-[72vh]">
            {chapters.map((c, i) => (
              <div
                key={c.kicker}
                ref={(el) => { plates.current[i] = el; }}
                className="absolute inset-0 will-change-transform"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <img src={c.img} alt={c.alt} className="h-full w-full object-cover" loading="lazy" width={1200} height={900} />
              </div>
            ))}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/10" />
          </div>
        </div>

        {/* Chapter markers */}
        <div className="pointer-events-none absolute inset-x-6 bottom-8 sm:inset-x-10">
          <div className="mb-3 flex items-end gap-4">
            {chapters.map((c, i) => (
              <div key={c.kicker} className="flex flex-1 flex-col gap-1.5">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.26em] text-[oklch(0.45_0.02_260)]">
                  {c.kicker.split(" — ")[0]}
                </span>
                <span
                  ref={(el) => { marks.current[i] = el; }}
                  className="block h-[2px] w-full origin-left bg-[var(--signal)] opacity-30 will-change-transform"
                />
              </div>
            ))}
          </div>
          <span className="block h-px w-full bg-black/12">
            <span ref={bar} className="block h-px w-full origin-left scale-x-0 bg-[var(--signal)]" />
          </span>
        </div>
      </div>
    </section>
  );
}
