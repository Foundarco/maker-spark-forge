import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { CTAButtonA } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const desc =
  "Careers at Clovr Relief — operations, logistics, field response, clinical, and recovery roles at a disaster-response nonprofit that deploys within hours.";
const title = `Careers — ${brand.name}`;

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/careers` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/careers` }],
  }),
  component: CareersPage,
});

const openings = [
  { title: "Duty Officer, Operations Center", team: "Detect", location: "Hybrid · rotating shifts", type: "Full time" },
  { title: "Logistics Manager, Regional Caches", team: "Deploy", location: "Gulf Coast, US", type: "Full time" },
  { title: "Field Response Lead", team: "Deliver", location: "Deployable · 60% travel", type: "Full time" },
  { title: "Clinical Coordinator", team: "Deliver", location: "Remote + deployments", type: "Full time" },
  { title: "Recovery Program Manager", team: "Rebuild", location: "Eastern Caribbean", type: "Fixed term" },
  { title: "Data & Impact Analyst", team: "Operations", location: "Remote", type: "Full time" },
];

const benefits = [
  "Deployment insurance, medical cover, and post-deployment decompression leave",
  "Paid readiness training and certifications",
  "Flexible schedules between activations",
  "Transparent pay bands published internally",
];

function CareersPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="Careers"
            title="Hard work, unusually clear purpose."
            lede="Small permanent team, big rostered capacity. If you want your operational skills pointed at the worst days people have, this is the place."
          />
        </div>
      </div>

      <Section wide>
        <SectionLabel n="01" tone="light">Open roles</SectionLabel>
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {openings.map((o) => (
            <li key={o.title} className="grid gap-2 py-6 md:grid-cols-[1.6fr_1fr_1fr_auto] md:items-center md:gap-8">
              <h2 className="font-display text-lg font-semibold text-ink">{o.title}</h2>
              <p className="text-sm text-muted-foreground">{o.team}</p>
              <p className="text-sm text-muted-foreground">{o.location}</p>
              <a
                className="justify-self-start text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:underline"
                href={`mailto:${brand.contact.careers}?subject=${encodeURIComponent(o.title)}`}
              >
                Apply
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <div className="border-t border-border bg-[var(--night)]">
        <Section wide>
          <SectionLabel n="02" tone="light">What we offer</SectionLabel>
          <ul className="mt-10 grid gap-px bg-border sm:grid-cols-2">
            {benefits.map((b) => (
              <li key={b} className="bg-[var(--night)] p-6 text-sm leading-relaxed text-foreground/80">{b}</li>
            ))}
          </ul>
          <div className="mt-12">
            <CTAButtonA
              variant="primary"
              href={`mailto:${brand.contact.careers}?subject=${encodeURIComponent("General application")}`}
            >
              Send a general application
            </CTAButtonA>
          </div>
        </Section>
      </div>
    </>
  );
}
