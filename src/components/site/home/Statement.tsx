import { Reveal, Words } from "@/components/site/Reveal";
import { UavCanvas } from "@/components/site/uav/UavCanvas";
import aerial from "@/assets/wf-aerial.jpg";

/** Bright statement panel — oversized type, the airframe floating in real 3D. */
export function Statement() {
  return (
    <section className="section-bridge-top relative overflow-hidden bg-[oklch(0.97_0.012_95)] py-24 text-[oklch(0.16_0.02_260)] sm:py-32">
      <UavCanvas
        mode="float"
        tone="light"
        scale={0.95}
        className="pointer-events-none absolute right-[-6%] top-2 h-[38vh] w-[80%] sm:h-[52vh] sm:w-[60%] lg:right-[-2%] lg:top-6 lg:h-[62vh] lg:w-[52%]"
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10">
        <Reveal variant="mask">
          <h2 className="display-cond max-w-4xl text-[clamp(2.8rem,8.4vw,7.2rem)] leading-[0.86] text-[oklch(0.12_0.02_260)]">
            <Words text="Detection that" />
            <span className="mt-2 block pl-[8%] sm:pl-[22%]"><Words text="saves the hours" step={90} /></span>
            <span className="mt-2 block"><Words text="that cost the most" step={90} /></span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[300px_1fr] lg:items-end">
          <Reveal delay={80} variant="left">
            <img
              src={aerial}
              alt="Aerial view of a wildland ridge under early smoke"
              className="h-56 w-full rounded-2xl object-cover shadow-[0_30px_60px_-40px_rgb(0_0_0/0.6)]"
              data-parallax="-40"
              loading="lazy"
              width={640}
              height={420}
            />
          </Reveal>
          <Reveal delay={140} variant="right">
            <p className="max-w-xl text-lg leading-relaxed text-[oklch(0.35_0.02_260)]">
              A fire that is seen in its first minutes is a different fire. We are building the sensing
              layer, the autonomous aircraft and the operations software as one system, so the first
              clear picture of an ignition arrives while it is still small.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
