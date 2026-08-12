import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { CTAButton } from "@/components/site/CTAButton";
import { SensorNetwork } from "@/components/site/SensorNetwork";
import { ThermalCompare } from "@/components/site/ThermalCompare";
import { MissionControl } from "@/components/site/MissionControl";
import { media, sensing, uavCapabilities, fieldConstraints } from "@/config/system";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const title = `Technology — Sensors, UAV, Thermal, Software | ${brand.name}`;
const desc =
  "The technology under development: distributed environmental sensor nodes, wireless communications, autonomous UAV flight, thermal and RGB imaging, geospatial processing, and mission control software.";

export const Route = createFileRoute("/technology")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/technology` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/technology` }],
  }),
  component: TechnologyPage,
});

function TechnologyPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="Technology"
            title="Sensors on the ground. Eyes in the air. Software in between."
            lede="Four technology tracks, developed together. Everything described here is in development or prototype unless stated otherwise."
          />
        </div>
      </div>

      {/* Sensor nodes */}
      <Section wide>
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Reveal>
            <SectionLabel n="01" tone="light">Sensor nodes</SectionLabel>
            <h2 className="display-cond mt-6 text-[clamp(2rem,4.6vw,3.6rem)] text-ink">Detection starts on the ground.</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Field-hardened, solar-powered nodes designed to sit unattended in remote terrain and report over
              low-bandwidth wireless links. Detection logic runs close to the sensor so the network can stay quiet
              until something matters.
            </p>
            <ul className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2">
              {sensing.map((s) => (
                <li key={s.label} className="bg-[var(--night)] px-5 py-4">
                  <p className="text-sm font-semibold text-ink">{s.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.note}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-muted-foreground">
              Specifications are not finalised. Node counts and deployments do not exist yet.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="blueprint-grid border border-border bg-[var(--night)] p-5 text-foreground/45">
              <SensorNetwork className="aspect-[10/9]" />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* UAV */}
      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
            <Reveal>
              <img
                src={media.benchImg}
                alt="UAV airframe with camera payload under assembly on a workbench"
                className="w-full border border-border object-cover"
                loading="lazy"
                width={1600}
                height={1104}
              />
            </Reveal>
            <Reveal delay={120}>
              <SectionLabel n="02" tone="light">Aircraft &amp; autonomy</SectionLabel>
              <h2 className="display-cond mt-6 text-[clamp(2rem,4.6vw,3.6rem)] text-ink">Then we send eyes.</h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Airframe, payload, navigation, and link design are being developed against one job: get a useful
                sensor over a set of coordinates quickly, with a human able to intervene at any point.
              </p>
              <ul className="mt-8 grid gap-px border border-border bg-border">
                {uavCapabilities.map((c) => (
                  <li key={c.title} className="flex flex-wrap items-baseline justify-between gap-3 bg-[var(--night)] px-5 py-4">
                    <div className="min-w-[13rem] flex-1">
                      <p className="text-sm font-semibold text-ink">{c.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.body}</p>
                    </div>
                    <span className="border border-border px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-foreground/70">
                      {c.state}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-muted-foreground">
                We do not claim full autonomy. Operator oversight is a design requirement, not a fallback.
              </p>
            </Reveal>
          </div>
        </Section>
      </div>

      {/* Thermal + RGB */}
      <Section wide>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal>
            <SectionLabel n="03" tone="light">Thermal + visual intelligence</SectionLabel>
            <h2 className="display-cond mt-6 text-[clamp(2rem,4.6vw,3.6rem)] text-ink">Two sensors, one picture.</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Optical imagery carries context a person can read instantly. Thermal is intended to surface heat that
              smoke, canopy, or darkness would otherwise hide. Paired with position, altitude, heading, and terrain,
              they become an observation rather than a photograph.
            </p>
            <ul className="mt-8 space-y-2.5 text-sm text-muted-foreground">
              {[
                "Georeferenced frames tied to aircraft position",
                "Heat-pattern context alongside optical detail",
                "Terrain and access visible in the same view",
                "Designed to be readable under time pressure",
              ].map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--signal)]" aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <ThermalCompare />
          </Reveal>
        </div>
      </Section>

      {/* Software */}
      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <Reveal>
            <SectionLabel n="04" tone="light">Mission control software</SectionLabel>
            <h2 className="display-cond mt-6 max-w-3xl text-[clamp(2rem,4.6vw,3.6rem)] text-ink">
              The layer that makes it one system.
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Live map, sensor nodes, active alerts, aircraft position and flight path, thermal and RGB frames,
              weather, incident status, communications, and the mission timeline — in one place, with one record.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <MissionControl />
          </Reveal>
        </Section>
      </div>

      {/* Field engineering */}
      <Section wide>
        <Reveal>
          <SectionLabel n="05" tone="light">Field engineering</SectionLabel>
          <h2 className="display-cond mt-6 max-w-3xl text-[clamp(2rem,4.6vw,3.6rem)] text-ink">Designed for the field.</h2>
        </Reveal>
        <Reveal delay={100}>
          <ul className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {fieldConstraints.map((f) => (
              <li key={f.title} className="bg-[var(--night)] px-6 py-6">
                <p className="text-base font-semibold text-ink">{f.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
        <div className="mt-10 flex flex-wrap gap-3">
          <CTAButton to="/development" variant="primary">Development status</CTAButton>
          <CTAButton to="/join" variant="ghost" className="border border-border text-ink hover:bg-surface">
            Build with us
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
