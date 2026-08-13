import { Reveal } from "@/components/site/Reveal";
import { UavCanvas } from "@/components/site/uav/UavCanvas";
import canyon from "@/assets/j-canyon.jpg";

/** Dark cinematic beat — the airframe drifting over terrain. */
export function FlyBanner() {
  return (
    <section className="relative h-[96svh] overflow-hidden bg-[var(--night)]">
      <img
        src={canyon}
        alt=""
        aria-hidden
        className="h-full w-full object-cover opacity-70"
        loading="lazy"
        width={1600}
        height={1000}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,22,0.75),rgba(6,12,22,0.25)_45%,rgba(6,12,22,0.92))]" />
      <UavCanvas
        mode="scroll"
        tone="dark"
        scale={1.3}
        className="pointer-events-none absolute inset-x-0 top-[16%] h-[52%]"
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-16 sm:px-10">
        <Reveal>
          <h2 className="display-cond max-w-4xl text-[clamp(2.8rem,9vw,8rem)] leading-[0.86] text-ink">
            Minutes, not mornings
          </h2>
          <p className="mt-6 max-w-lg text-lg text-ink/80">
            One aircraft, one sensing network, one operations picture — designed together so the
            first honest look at a fire is not the slowest part of the response.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
