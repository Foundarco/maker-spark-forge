import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { programs } from "@/config/programs";
import { SITE_URL } from "@/lib/seo";
import rebuildImg from "@/assets/cr-rebuild.jpg";
import logisticsImg from "@/assets/cr-logistics.jpg";

const desc =
  "Clovr Relief is a disaster-response nonprofit founded in 2015. Meet the organization behind the operations center, the caches, and the recovery crews.";
const title = `About — ${brand.name}`;

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

const timeline = [
  { year: "2015", body: "Founded after a hurricane season where supplies arrived faster than the paperwork allowed them to move." },
  { year: "2018", body: "First permanent regional cache opened; pre-positioning becomes the operating model." },
  { year: "2021", body: "Operations center goes 24/7 with continuous hazard monitoring and activation thresholds." },
  { year: "2024", body: "Recovery programs formalized — repair crews, cash assistance, and readiness training." },
  { year: "Today", body: "Twelve caches across three ocean basins, with local partners leading in every region." },
];

function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <img
          src={logisticsImg}
          alt="Pallets of emergency supplies staged at a logistics warehouse at night"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[var(--night)]/85" aria-hidden />
        <div className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <PageHeader
            eyebrow="About"
            title="Built by people who kept arriving too late."
            lede={`${brand.legalName} was founded in ${brand.established} by logistics and emergency-medicine veterans who were tired of watching supply chains fail in the first 72 hours.`}
          />
        </div>
      </section>

      <Section wide>
        <SectionLabel n="01" tone="light">History</SectionLabel>
        <ol className="mt-10 divide-y divide-border border-y border-border">
          {timeline.map((t) => (
            <li key={t.year} className="grid gap-2 py-6 sm:grid-cols-[140px_1fr] sm:gap-10">
              <span className="display-cond text-3xl text-primary">{t.year}</span>
              <p className="leading-relaxed text-muted-foreground">{t.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <img
              src={rebuildImg}
              alt="Volunteers repairing a storm-damaged roof at sunrise"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <div>
              <SectionLabel n="02" tone="light">How we're organized</SectionLabel>
              <p className="mt-6 text-lg leading-relaxed text-foreground/80">
                Four programs, one continuous loop. Staff are small and permanent; capacity scales
                through rostered volunteers and local partners rather than a standing army.
              </p>
              <ul className="mt-8 grid gap-px bg-border sm:grid-cols-2">
                {programs.map((p) => (
                  <li key={p.slug} className="bg-[var(--night)] p-5">
                    <span className="display-cond text-2xl" style={{ color: p.accent }}>{p.n}</span>
                    <p className="mt-2 font-display text-base font-bold text-ink">{p.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{p.discipline}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      </div>

      <Section wide className="text-center">
        <h2 className="display-cond mx-auto max-w-3xl text-[clamp(2rem,5vw,4rem)] text-ink">
          Work with us, or fund the work.
        </h2>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <CTAButton to="/careers" variant="primary">Open roles</CTAButton>
          <CTAButton to="/donate" variant="ghost" className="border border-border text-ink hover:bg-surface">
            Give now
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
