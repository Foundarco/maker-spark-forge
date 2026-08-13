import { Reveal, Words } from "@/components/site/Reveal";
import { UavCanvas } from "@/components/site/uav/UavCanvas";

const left = [
  { n: "01", t: "Signal", d: "A node flags heat or smoke and pushes a coordinate to the Operations Center." },
  { n: "02", t: "Launch", d: "The aircraft leaves its pad autonomously — no pilot, no drive time." },
  { n: "03", t: "Transit", d: "It routes itself through terrain and wind toward the flagged coordinate." },
] as const;

const right = [
  { n: "04", t: "Look", d: "Optical reads terrain and access. Thermal reads what smoke and canopy hide." },
  { n: "05", t: "Map", d: "Position, footprint and spread direction resolve into a live incident picture." },
  { n: "06", t: "Hand off", d: "Responders receive it while the fire is still something they can get ahead of." },
] as const;

/** Center-stage airframe with the operating sequence on either side. */
export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-[oklch(0.94_0.014_95)] py-24 text-[oklch(0.16_0.02_260)] sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <Reveal variant="mask">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[oklch(0.5_0.02_260)]">
            UAV-01 · Operating sequence
          </p>
          <h2 className="display-cond mt-5 max-w-3xl text-[clamp(2.6rem,7vw,6rem)] leading-[0.88] text-[oklch(0.12_0.02_260)]">
            <Words text="How the system works" step={90} />
          </h2>
        </Reveal>

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-[1fr_1.15fr_1fr]">
          <div className="flex flex-col gap-9">
            {left.map((s, i) => (
              <Reveal key={s.n} delay={i * 80} variant="left">
                <Step {...s} align="right" />
              </Reveal>
            ))}
          </div>

          <div className="relative order-first h-[46vh] lg:order-none lg:h-[64vh]" data-parallax="-50">
            <div className="absolute inset-[8%] rounded-[999px] bg-[radial-gradient(circle,rgba(255,255,255,0.9),rgba(255,255,255,0)_70%)]" aria-hidden />
            <div className="absolute inset-0 blueprint-grid text-[oklch(0.2_0.02_260)] opacity-[0.18]" aria-hidden />
            <UavCanvas mode="scroll" tone="light" scale={1.05} className="relative h-full w-full" />
          </div>

          <div className="flex flex-col gap-9">
            {right.map((s, i) => (
              <Reveal key={s.n} delay={i * 80} variant="right">
                <Step {...s} align="left" />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({ n, t, d, align }: { n: string; t: string; d: string; align: "left" | "right" }) {
  return (
    <div className={align === "right" ? "lg:text-right" : ""}>
      <p className="font-mono text-[0.68rem] tracking-[0.24em] text-[var(--signal)]">{n}</p>
      <p className="display-cond mt-2 text-[clamp(1.6rem,2.6vw,2.4rem)] text-[oklch(0.12_0.02_260)]">{t}</p>
      <p className="mt-2 text-sm leading-relaxed text-[oklch(0.4_0.02_260)]">{d}</p>
    </div>
  );
}
