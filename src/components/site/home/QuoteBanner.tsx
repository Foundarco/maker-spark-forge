import { Reveal } from "@/components/site/Reveal";
import responders from "@/assets/j-responders.jpg";

/** Full-bleed portrait panel with a single voice from the field. */
export function QuoteBanner() {
  return (
    <section className="relative overflow-hidden bg-[var(--night)]">
      <img
        src={responders}
        alt="Wildland firefighters preparing at the edge of an incident"
        className="h-[86vh] w-full scale-110 object-cover object-left"
        data-parallax="70"
        loading="lazy"
        width={1600}
        height={1000}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,12,22,0.25)_0%,rgba(6,12,22,0.55)_46%,rgba(6,12,22,0.9)_100%)]" />
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto grid w-full max-w-7xl px-6 sm:px-10 lg:grid-cols-2">
          <div />
          <Reveal variant="blur">
            <blockquote className="text-[clamp(1.5rem,2.6vw,2.4rem)] font-medium leading-snug text-ink">
              “The hardest part is the beginning. If somebody can tell us exactly what is burning and
              where it is going while it is still small, that changes the whole day.”
            </blockquote>
            <p className="mt-8 flex items-center gap-3 text-sm text-ink/70">
              Wildland fire captain
              <span className="h-4 w-px bg-[var(--signal)]" aria-hidden />
              Northern California
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
