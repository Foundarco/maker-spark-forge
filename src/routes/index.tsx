import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionLabel } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { CTAButton } from "@/components/site/CTAButton";
import { MissionJourney } from "@/components/site/journey/MissionJourney";
import { ThermalCompare } from "@/components/site/ThermalCompare";
import { MissionControl } from "@/components/site/MissionControl";
import { brand } from "@/config/brand";
import { phases, expansion } from "@/config/system";
import { SITE_URL } from "@/lib/seo";

const title = `${brand.name} — See the fire sooner`;
const desc = brand.mission;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NGO",
          name: brand.legalName,
          url: `${SITE_URL}/`,
          slogan: brand.tagline,
          description: desc,
          email: brand.contact.general,
        }),
      },
    ],
  }),
  component: HomePage,
});

/** Four-word capability chips — labels, not specification lists. */
const payload = ["Optical", "Thermal", "Autonomy", "Telemetry"];

const pillars = [
  { k: "Sensors", v: "Distributed detection across terrain, continuously." },
  { k: "Operations Center", v: "Continuous human monitoring and coordination — 24/7/365." },
  { k: "UAV", v: "Rapid investigation that turns a signal into an observation." },
  { k: "Software", v: "Alerts, missions, imagery and one incident record." },
];

function HomePage() {
  return (
    <>
      {/* 01 — THE MISSION FLIGHT (hero + full system story, scroll-driven) */}
      <MissionJourney />

      {/* 02 — WHY EARLY INFORMATION MATTERS */}
      <Section wide>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <Reveal>
            <SectionLabel n="01" tone="light">Why it matters</SectionLabel>
            <h2 className="display-cond mt-6 text-[clamp(2.2rem,5.6vw,4.4rem)] text-ink">
              Early information<br />changes the outcome.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Detection, verification and getting eyes on the situation each cost time — and in remote terrain,
              each costs more. We are building a system aimed squarely at that gap.
            </p>
            <ul className="mt-9 grid gap-px border border-border bg-border sm:grid-cols-3">
              {["Detection", "Verification", "Eyes on it"].map((k, i) => (
                <li key={k} className="bg-[var(--night)] px-5 py-6">
                  <span className="font-mono text-[0.62rem] tracking-[0.2em] text-[var(--signal)]">0{i + 1}</span>
                  <p className="mt-3 text-sm font-semibold text-ink">{k}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* 03 — OPERATIONS CENTER / COMMAND LAYER */}
      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <Reveal>
              <SectionLabel n="02" tone="light">{brand.opsCenter}</SectionLabel>
              <h2 className="display-cond mt-6 max-w-2xl text-[clamp(2.2rem,5.4vw,4.4rem)] text-ink">
                The command layer.
              </h2>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                When an alert comes in, someone is watching. The concept interface below mirrors the internal
                tools we are building for the Operations Center.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <CTAButton to="/operations" variant="primary">Inside the Operations Center</CTAButton>
            </Reveal>
          </div>
          <Reveal delay={140} className="mt-12">
            <MissionControl />
          </Reveal>
        </Section>
      </div>

      {/* 04 — UAV PAYLOAD + THERMAL */}
      <Section wide>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <SectionLabel n="03" tone="light">UAV-01 · Payload</SectionLabel>
            <h2 className="display-cond mt-6 text-[clamp(2.2rem,5vw,4rem)] text-ink">
              Two ways of seeing the same ridge.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Optical reads terrain, access and context. Thermal is designed to show heat where smoke, canopy or
              darkness hide it.
            </p>
            <ul className="mt-8 flex flex-wrap gap-px bg-border">
              {payload.map((p) => (
                <li
                  key={p}
                  className="bg-[var(--night)] px-4 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground/75"
                >
                  {p}
                </li>
              ))}
            </ul>
            <CTAButton to="/technology" variant="ghost" className="mt-8 border border-border text-ink hover:bg-surface">
              The technology
            </CTAButton>
          </Reveal>
          <Reveal delay={120}>
            <ThermalCompare />
          </Reveal>
        </div>
      </Section>

      {/* 05 — WHY THE SYSTEM IS DIFFERENT */}
      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <SectionLabel n="04" tone="light">Integration</SectionLabel>
              <h2 className="display-cond mt-6 text-[clamp(2.2rem,5vw,4rem)] text-ink">
                A drone alone isn't the system.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <ul className="grid gap-px bg-border">
                {pillars.map((r) => (
                  <li key={r.k} className="grid gap-2 bg-[var(--night)] px-6 py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                    <p className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[var(--signal)]">{r.k}</p>
                    <p className="text-base text-foreground/85">{r.v}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Section>
      </div>

      {/* 06 — DEVELOPMENT STATUS */}
      <Section wide>
        <Reveal>
          <SectionLabel n="05" tone="light">Where we actually are</SectionLabel>
          <h2 className="display-cond mt-6 max-w-3xl text-[clamp(2.2rem,5vw,4rem)] text-ink">
            Building Mission 01, in public.
          </h2>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            We are early. Nothing here is deployed. This is the honest state of the programme.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <ol className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {phases.map((p) => (
              <li key={p.n} className="bg-[var(--night)] px-6 py-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm tabular-nums text-[var(--signal)]">{p.n}</span>
                  <span
                    className={`border px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.16em] ${
                      p.state === "Ahead"
                        ? "border-border text-muted-foreground"
                        : "border-[color:var(--signal)]/50 text-[var(--signal)]"
                    }`}
                  >
                    {p.state}
                  </span>
                </div>
                <p className="mt-4 text-lg font-semibold text-ink">{p.title}</p>
              </li>
            ))}
          </ol>
        </Reveal>
        <div className="mt-8">
          <CTAButton to="/development" variant="ghost" className="border border-border text-ink hover:bg-surface">
            Full development status
          </CTAButton>
        </div>
      </Section>

      {/* 07 — WILDFIRE IS ONLY THE BEGINNING */}
      <div className="border-y border-border bg-[var(--night)]">
        <Section>
          <Reveal>
            <SectionLabel n="06" tone="light">Later, not now</SectionLabel>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Wildfire is only the beginning.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Wildfire is Mission 01 and it has our full attention. The foundation — distributed sensing, autonomy,
              aerial imaging and coordinated operations — could eventually serve other emergencies.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <ul className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {expansion.map((e) => (
                <li key={e.title} className="bg-[var(--night)] px-5 py-5">
                  <p className="text-sm font-semibold text-ink">{e.title}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </Section>
      </div>

      {/* 08 — CTA */}
      <Section wide className="text-center">
        <Reveal>
          <h2 className="display-cond mx-auto max-w-4xl text-[clamp(2.2rem,6vw,5rem)] text-ink">
            Build Mission 01 with us.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Engineers, roboticists, researchers, fire professionals, mentors, sponsors and manufacturing partners.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <CTAButton to="/donate" variant="primary">Support the mission</CTAButton>
            <CTAButton to="/join" variant="ghost" className="border border-border text-ink hover:bg-surface">
              Build with us
            </CTAButton>
            <CTAButton to="/partners" variant="ghost" className="border border-border text-ink hover:bg-surface">
              Partner with us
            </CTAButton>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
