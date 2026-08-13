import { Reveal } from "@/components/site/Reveal";
import sensor from "@/assets/wf-sensor.jpg";
import transit from "@/assets/j-transit.jpg";
import ops from "@/assets/j-ops.jpg";

const panels = [
  {
    img: sensor,
    alt: "Field sensor node mounted on a ridge",
    kicker: "01 — Sense",
    title: ["Eyes", "on the ridge"],
    body: "Low-power sensor nodes watch heat, smoke and wind across terrain where nobody is looking, and stay awake when the network is thin.",
  },
  {
    img: transit,
    alt: "Autonomous aircraft in transit above foothills",
    kicker: "02 — Investigate",
    title: ["Airborne", "in minutes"],
    body: "A signal launches the aircraft. It flies itself to the coordinate and turns a maybe into a look — optical for context, thermal for what smoke hides.",
  },
  {
    img: ops,
    alt: "Operations Center console with live incident map",
    kicker: "03 — Inform",
    title: ["Answers,", "not alarms"],
    body: "The Operations Center is staffed around the clock. Responders get position, spread and access — the picture they need to decide.",
  },
] as const;

/** Three alternating image / oversized-headline panels. */
export function SplitPanels() {
  return (
    <section className="bg-[oklch(0.97_0.012_95)] pb-24 text-[oklch(0.16_0.02_260)] sm:pb-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-20 px-6 sm:gap-28 sm:px-10">
        {panels.map((panel, i) => (
          <Reveal key={panel.kicker}>
            <div
              className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div className="overflow-hidden rounded-3xl">
                <img
                  src={panel.img}
                  alt={panel.alt}
                  loading="lazy"
                  width={1200}
                  height={900}
                  className="h-[42vh] w-full object-cover transition-transform duration-[1200ms] ease-out hover:scale-[1.04] sm:h-[62vh]"
                />
              </div>
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[oklch(0.5_0.02_260)]">
                  {panel.kicker}
                </p>
                <h3 className="display-cond mt-5 text-[clamp(2.6rem,6.4vw,5.6rem)] leading-[0.88] text-[oklch(0.12_0.02_260)]">
                  {panel.title[0]}
                  <span className="block">{panel.title[1]}</span>
                </h3>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-[oklch(0.36_0.02_260)]">{panel.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
