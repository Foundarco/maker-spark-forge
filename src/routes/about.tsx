import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { CTAButton } from "@/components/site/CTAButton";
import { media, phases } from "@/config/system";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const title = `About — An Early-Stage Wildfire Technology Nonprofit | ${brand.name}`;
const desc =
  "Clovr Labs is an early-stage, mission-driven nonprofit developing wildfire detection and autonomous UAV response technology, with a 24/7/365 Operations Center.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/about` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="About"
            title="An engineering organization with one mission in front of it."
            lede={`${brand.name} is a mission-driven nonprofit developing technology to improve wildfire detection and early response. We are early-stage, and we say so.`}
          />
        </div>
      </div>

      <Section wide>
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Reveal className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            <SectionLabel n="01" tone="light">Who we are</SectionLabel>
            <p>
              We are engineers, developers, and researchers building one integrated system: distributed wildfire
              sensing, autonomous UAV investigation, and the mission software that connects them. The organization is
              structured as a nonprofit because the output should be a capability for responders, not a product line.
            </p>
            <p>
              Alongside the engineering, we run a {brand.opsCenter} — the part of the organization that already
              operates continuously, and the seat from which every future mission will be coordinated.
            </p>
            <p className="text-ink">{brand.status}. Prototype in progress. Building Mission 01.</p>
          </Reveal>
          <Reveal delay={120}>
            <img
              src={media.opsImg}
              alt="Operations center workstations at night"
              className="w-full border border-border object-cover"
              loading="lazy"
              width={1600}
              height={1104}
            />
          </Reveal>
        </div>
      </Section>

      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <SectionLabel n="02" tone="light">What we hold ourselves to</SectionLabel>
          <ul className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {brand.values.map((v) => (
              <li key={v.title} className="bg-[var(--night)] px-6 py-8">
                <p className="text-lg font-semibold text-ink">{v.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section wide>
        <SectionLabel n="03" tone="light">Programme status</SectionLabel>
        <ol className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {phases.map((p) => (
            <li key={p.n} className="bg-[var(--night)] px-6 py-6">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm tabular-nums text-[var(--signal)]">{p.n}</span>
                <span className="border border-border px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {p.state}
                </span>
              </div>
              <p className="mt-3 text-base font-semibold text-ink">{p.title}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap gap-3">
          <CTAButton to="/development" variant="primary">Full development status</CTAButton>
          <CTAButton to="/join" variant="ghost" className="border border-border text-ink hover:bg-surface">
            Join the team
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
