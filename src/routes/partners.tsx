import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { CTAButtonA } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const desc =
  "Partner with Clovr Relief — local response organizations, transport and logistics providers, clinical networks, and corporate funders who keep caches stocked.";
const title = `Partners — ${brand.name}`;

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/partners` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/partners` }],
  }),
  component: PartnersPage,
});

const tracks = [
  {
    name: "Local response organizations",
    body: "Community groups, volunteer fire services, faith networks, and municipal agencies who lead on the ground. We supply capacity; you keep command of your own community's response.",
    asks: ["Shared situational reporting", "Joint distribution planning", "Cache co-location where possible"],
  },
  {
    name: "Transport & logistics",
    body: "Air, marine, and overland operators who can move pallets on short notice into degraded infrastructure.",
    asks: ["Standby capacity agreements", "Hazard-specific load planning", "Priority routing during activation"],
  },
  {
    name: "Clinical networks",
    body: "Hospital systems and clinician groups who can credential and release staff for short field rotations.",
    asks: ["Rostered clinical volunteers", "Medical resupply pipelines", "Field triage protocol alignment"],
  },
  {
    name: "Corporate & institutional funders",
    body: "Multi-year funding is what keeps supply pre-positioned during quiet seasons, which is exactly when it is cheapest to buy.",
    asks: ["Season-ahead cache underwriting", "Matching gift programs", "In-kind equipment and services"],
  },
];

function PartnersPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="Partners"
            title="Nobody responds alone."
            lede="Every deployment runs alongside people who already live and work in the affected region. Partnership is the operating model, not an add-on."
          />
        </div>
      </div>

      <Section wide>
        <SectionLabel n="01" tone="light">Partnership tracks</SectionLabel>
        <div className="mt-10 grid gap-px bg-border md:grid-cols-2">
          {tracks.map((t) => (
            <article key={t.name} className="bg-background p-8">
              <h2 className="font-display text-xl font-bold text-ink">{t.name}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{t.body}</p>
              <ul className="mt-6 space-y-2">
                {t.asks.map((a) => (
                  <li key={a} className="flex gap-3 text-sm text-foreground/75">
                    <span className="mt-2 h-px w-5 shrink-0 bg-border" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <CTAButtonA
            variant="primary"
            href={`mailto:${brand.contact.partners}?subject=${encodeURIComponent("Partnership enquiry")}`}
          >
            Talk to the partnerships team
          </CTAButtonA>
        </div>
      </Section>
    </>
  );
}
