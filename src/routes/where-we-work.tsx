import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { ResponseGlobe } from "@/components/site/ResponseGlobe";
import { CTAButton } from "@/components/site/CTAButton";
import { regions } from "@/config/programs";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const desc =
  "Clovr Relief pre-positions supplies and response teams across North America, the Caribbean, and the Pacific — see current active responses, recovery programs, and standby regions.";
const title = `Where We Work — ${brand.name}`;

export const Route = createFileRoute("/where-we-work")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/where-we-work` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/where-we-work` }],
  }),
  component: WhereWeWorkPage,
});

function WhereWeWorkPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="Where we work"
            title="Twelve caches. Three ocean basins."
            lede={`${brand.serviceArea}. Supplies sit inside the regions they serve, so a response never begins with a shipping delay.`}
          />
        </div>
      </div>

      <Section wide>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="blueprint-grid relative aspect-square w-full text-foreground/40">
            <ResponseGlobe className="absolute inset-0 h-full w-full" />
          </div>
          <div>
            <SectionLabel n="01" tone="light">Current posture</SectionLabel>
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {regions.map((r) => (
                <li key={r.name} className="py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-lg font-semibold text-ink">{r.name}</h2>
                    <span className="border border-border px-3 py-1 text-[0.68rem] uppercase tracking-[0.14em] text-foreground/75">
                      {r.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {r.hazard} — {r.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <div className="border-t border-border bg-[var(--night)]">
        <Section wide className="text-center">
          <h2 className="display-cond mx-auto max-w-3xl text-[clamp(2rem,5vw,4rem)] text-ink">
            Need help in one of these regions?
          </h2>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <CTAButton to="/request-help" variant="primary">Request help</CTAButton>
            <CTAButton to="/partners" variant="ghost" className="border border-border text-ink hover:bg-surface">
              Partner with us
            </CTAButton>
          </div>
        </Section>
      </div>
    </>
  );
}
