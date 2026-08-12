import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { CTAButton } from "@/components/site/CTAButton";
import { media, expansion } from "@/config/system";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const title = `Mission — Wildfire Detection + UAV Investigation | ${brand.name}`;
const desc = brand.mission;

export const Route = createFileRoute("/mission")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/mission` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/mission` }],
  }),
  component: MissionPage,
});

function MissionPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <img
          src={media.aerialImg}
          alt="Aerial view of a forested ridge with a small plume of smoke"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          width={1600}
          height={1104}
        />
        <div className="scrim-full absolute inset-0" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <PageHeader
            eyebrow={brand.mission01}
            title="Wildfires move fast. Early information matters."
            lede={brand.mission}
          />
        </div>
      </section>

      <Section wide>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <SectionLabel n="01" tone="light">The gap we're aiming at</SectionLabel>
          </Reveal>
          <Reveal delay={100} className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>
              Between a fire starting and someone knowing exactly what is happening, there is a stretch of time made
              of detection, verification, and observation. In remote terrain that stretch grows, and the situation
              changes while it does.
            </p>
            <p>
              Our mission is to compress it — with a distributed sensor network that notices, an Operations Center
              that evaluates, aircraft that go and look, and software that turns all of it into something a responder
              can use.
            </p>
            <p className="text-ink">
              We are early-stage and in development. We are building the system; we have not deployed it.
            </p>
          </Reveal>
        </div>
      </Section>

      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <SectionLabel n="02" tone="light">How we work</SectionLabel>
          <ul className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {brand.values.map((v, i) => (
              <li key={v.title} className="bg-[var(--night)] px-6 py-8">
                <span className="font-mono text-[0.62rem] tabular-nums text-[var(--signal)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-4 text-lg font-semibold text-ink">{v.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section wide>
        <div className="grid gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionLabel n="03" tone="light">Technology should serve people</SectionLabel>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              When conditions are dangerous and time matters, decisions get made with whatever information is at
              hand. Our job is to make that information arrive earlier and read more clearly. Fire professionals
              still decide; we are building the instrument, not the judgement.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <SectionLabel n="04" tone="light">Wildfire is only the beginning</SectionLabel>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Mission 01 has our full attention. In time, the same foundation could support other emergencies.
            </p>
            <ul className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2">
              {expansion.map((e) => (
                <li key={e.title} className="bg-[var(--night)] px-5 py-4">
                  <p className="text-sm font-semibold text-ink">{e.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{e.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <CTAButton to="/system" variant="primary">Explore the system</CTAButton>
          <CTAButton to="/development" variant="ghost" className="border border-border text-ink hover:bg-surface">
            Where we are
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
