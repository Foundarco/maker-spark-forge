import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { CTAButton } from "@/components/site/CTAButton";
import { MissionControl } from "@/components/site/MissionControl";
import { media, opsResponsibilities } from "@/config/system";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const title = `24/7/365 Operations Center | ${brand.name}`;
const desc =
  "Our Operations Center monitors the detection network, reviews alerts, opens and tracks incidents, coordinates UAV missions, and keeps the incident record — continuously.";

export const Route = createFileRoute("/operations")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/operations` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/operations` }],
  }),
  component: OperationsPage,
});

function OperationsPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <img
          src={media.opsImg}
          alt="Operations center interior at night with map and telemetry displays"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          width={1600}
          height={1104}
        />
        <div className="scrim-full absolute inset-0" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <PageHeader
            eyebrow={brand.opsCenter}
            title="When an alert comes in, someone is watching."
            lede="The Operations Center is a real organizational capability, staffed continuously. It is where automated detection meets human judgement, and where a mission is coordinated from alert to hand-off."
          />
        </div>
      </section>

      <Section wide>
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <SectionLabel n="01" tone="light">Responsibilities</SectionLabel>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              These are the functions the Operations Center owns across the system. As the detection network and
              aircraft mature, the same desk carries the new capability.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <ul className="grid gap-px border border-border bg-border">
              {opsResponsibilities.map((r, i) => (
                <li key={r} className="flex items-baseline gap-4 bg-[var(--night)] px-5 py-4">
                  <span className="font-mono text-[0.62rem] tabular-nums text-[var(--signal)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-foreground/85">{r}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <Reveal>
            <SectionLabel n="02" tone="light">Concept interface</SectionLabel>
            <h2 className="display-cond mt-6 max-w-3xl text-[clamp(2rem,4.6vw,3.6rem)] text-ink">
              One screen, one incident record.
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Live map, sensor nodes, active alerts, UAV location and flight path, thermal and RGB imagery, weather,
              incident status, communications, and mission timeline. The view below is a concept representation —
              the operational version lives inside our internal HQ.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <MissionControl />
          </Reveal>
        </Section>
      </div>

      <Section wide>
        <div className="grid gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionLabel n="03" tone="light">Human in the loop</SectionLabel>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Automated detection raises candidates. People decide what becomes an incident, whether an aircraft is
              worth launching, and what gets passed to responders. That review step is deliberate — a system that
              cries wolf is worse than no system.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <SectionLabel n="04" tone="light">What we will not publish</SectionLabel>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              We do not publish staffing numbers, response times, deployment counts, or performance statistics,
              because the system has not been evaluated in the field yet. When there is measured data, it will be
              published with its methodology.
            </p>
          </Reveal>
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <CTAButton to="/system" variant="primary">See the architecture</CTAButton>
          <CTAButton to="/partners" variant="ghost" className="border border-border text-ink hover:bg-surface">
            Partner with us
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
