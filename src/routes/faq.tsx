import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const desc =
  "Answers about how Clovr Relief decides where to respond, how quickly aid arrives, how donations are used, and how to request help or volunteer.";
const title = `FAQ — ${brand.name}`;

const groups = [
  {
    heading: "Responding",
    items: [
      {
        q: "How do you decide where to respond?",
        a: "Hazard severity, population exposure, and whether local capacity is already overwhelmed. Activation thresholds are set in advance so the decision isn't driven by media attention.",
      },
      {
        q: "How fast do you actually arrive?",
        a: "Our median time from activation to first delivery is six hours in regions with a nearby cache. Where access is destroyed, air and marine transport partners extend that window, and we say so publicly in the response report.",
      },
      {
        q: "Do you replace local responders?",
        a: "No. Local agencies and community organizations keep command of their own response. We supply capacity, supply, and logistics behind them.",
      },
    ],
  },
  {
    heading: "Getting help",
    items: [
      {
        q: "How do I request assistance?",
        a: "Use the request form. It routes directly into the operations queue and is monitored continuously. If life is in immediate danger, contact local emergency services first.",
      },
      {
        q: "Is aid free?",
        a: "Always. We never charge affected households for supplies, medical care, shelter, or repair work.",
      },
      {
        q: "What information should I include?",
        a: "Location, number of people affected, primary need, access conditions, and any other agencies already involved. Photos of site conditions help planning considerably.",
      },
    ],
  },
  {
    heading: "Giving",
    items: [
      {
        q: "Where does my donation go?",
        a: "Ninety-one cents of every dollar funds programs. The largest single use is pre-positioned supply, bought out of season when it is cheapest and staged where it will be needed.",
      },
      {
        q: "Can I direct my gift to a specific disaster?",
        a: "You can express a preference, and we honour it wherever the funds can be used responsibly. Unrestricted gifts are more valuable because they let us buy before an event, not after.",
      },
      {
        q: "Do you publish financials?",
        a: "Yes. Allocation figures are published on the impact page and restated each year with the audited annual report.",
      },
    ],
  },
  {
    heading: "Volunteering",
    items: [
      {
        q: "Can I deploy without prior experience?",
        a: "Not to a field role. Deployable volunteers complete screening and readiness training first. Cache shifts and remote operations roles are open to newcomers immediately.",
      },
      {
        q: "How often would I be called?",
        a: "Only when your role, credentials, and region match an active response. Most field volunteers deploy one to three times a year.",
      },
    ],
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/faq` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/faq` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: groups.flatMap((g) =>
            g.items.map((i) => ({
              "@type": "Question",
              name: i.q,
              acceptedAnswer: { "@type": "Answer", text: i.a },
            })),
          ),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="FAQ"
            title="Questions we get most."
            lede="If something here doesn't answer what you need, the operations center will."
          />
        </div>
      </div>

      <Section>
        <div className="space-y-16">
          {groups.map((g) => (
            <section key={g.heading}>
              <h2 className="rule-label text-primary">{g.heading}</h2>
              <dl className="mt-6 divide-y divide-border border-y border-border">
                {g.items.map((i) => (
                  <div key={i.q} className="py-6">
                    <dt className="font-display text-lg font-semibold text-ink">{i.q}</dt>
                    <dd className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{i.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap gap-3">
          <CTAButton to="/request-help" variant="primary">Request help</CTAButton>
          <CTAButton to="/contact" variant="ghost" className="border border-border text-ink hover:bg-surface">
            Contact us
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
