import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const title = `FAQ | ${brand.name}`;
const desc =
  "Common questions about Clovr Labs: what the wildfire detection and UAV system is, what stage it is at, how the Operations Center works, and how to get involved.";

const faqs = [
  {
    q: "What are you actually building?",
    a: "An integrated wildfire detection and aerial investigation system: distributed environmental sensor nodes, automated detection, a 24/7/365 Operations Center that reviews alerts and coordinates missions, UAVs that fly to investigate, thermal and RGB imaging, and the software that connects all of it and delivers information to responders.",
  },
  {
    q: "Is the system deployed?",
    a: "No. We are early-stage and in development. Prototype work is in progress, field testing is ahead of us, and no sensor network or aircraft is in operational service. Our development status page describes exactly where each stage stands.",
  },
  {
    q: "Are you a disaster-relief or humanitarian aid organization?",
    a: "No. We are a technology organization. Our first and current mission is wildfire detection and UAV investigation. The same engineering foundation could eventually support other emergencies, but that is future work, not what we do today.",
  },
  {
    q: "What does the Operations Center do?",
    a: "It monitors the detection network, receives and reviews alerts, opens and tracks incidents, coordinates UAV missions, tracks aircraft and field assets, reviews imagery and telemetry, maintains incident timelines, and communicates with field personnel and response partners. It operates 24/7/365.",
  },
  {
    q: "Are the UAVs fully autonomous?",
    a: "No, and we are not claiming that. We are developing autonomous and operator-assisted navigation with a human in the loop by design. An operator can intervene at any point in a mission.",
  },
  {
    q: "Do you replace fire agencies?",
    a: "No. We build an information tool. Fire professionals make the decisions; our aim is to get them a clearer picture earlier.",
  },
  {
    q: "Why publish statistics-free pages?",
    a: "Because we have not measured anything in the field yet. We will not publish response times, coverage figures, or detection performance until they exist and can be described with their methodology.",
  },
  {
    q: "How can I get involved?",
    a: "We are looking for engineers, robotics and software developers, researchers, fire professionals, mentors, sponsors, and manufacturing partners. The Join page explains how to reach us.",
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
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
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
            title="Questions we get asked."
            lede="Straight answers about what exists, what doesn't yet, and how the system is meant to work."
          />
        </div>
      </div>

      <Section>
        <dl className="grid gap-px border border-border bg-border">
          {faqs.map((f) => (
            <div key={f.q} className="bg-[var(--night)] px-6 py-7">
              <dt className="text-lg font-semibold text-ink">{f.q}</dt>
              <dd className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-12 flex flex-wrap gap-3">
          <CTAButton to="/system" variant="primary">Explore the system</CTAButton>
          <CTAButton to="/contact" variant="ghost" className="border border-border text-ink hover:bg-surface">
            Contact us
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
