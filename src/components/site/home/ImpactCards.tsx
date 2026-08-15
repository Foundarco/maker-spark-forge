import { Reveal, Words } from "@/components/site/Reveal";
import ridge from "@/assets/j-ridge.jpg";
import bench from "@/assets/wf-bench.jpg";
import opsRoom from "@/assets/wf-ops.jpg";

const cards = [
  { img: ridge, alt: "Ridgeline at dawn", stat: "24/7/365", label: "Operations Center coverage by design" },
  { img: bench, alt: "Prototype hardware on the bench", stat: "Wildfire", label: "Detection and UAV response" },
  { img: opsRoom, alt: "Operations console", stat: "0", label: "Deployments yet — we are building in public" },
] as const;

/** Honest, non-inflated impact statements over imagery. */
export function ImpactCards() {
  return (
    <section className="bg-[var(--night)] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <Reveal variant="mask">
          <h2 className="display-cond max-w-3xl text-[clamp(2.4rem,6vw,5rem)] text-ink">
            <Words text="Where we stand" step={100} />
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.stat} delay={i * 120} variant="rise-rotate">
              <article className="group relative h-[52vh] overflow-hidden rounded-3xl">
                <img
                  src={c.img}
                  alt={c.alt}
                  loading="lazy"
                  width={900}
                  height={1200}
                  className="h-full w-full scale-110 object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.16]"
                  data-parallax="42"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,_var(--night)_10%,_transparent),color-mix(in_oklab,_var(--night)_85%,_transparent))]" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <p className="display-cond text-[clamp(2.4rem,4.4vw,3.6rem)] text-ink">{c.stat}</p>
                  <p className="mt-2 max-w-[16rem] text-sm text-ink/80">{c.label}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
