import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const desc =
  "Contact Clovr Relief — operations center, partnerships, press, and careers. Emergency assistance requests go through our dedicated request form.";
const title = `Contact — ${brand.name}`;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/contact` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
  }),
  component: ContactPage,
});

const desks = [
  { name: "General enquiries", email: brand.contact.general, note: "Anything that doesn't fit elsewhere." },
  { name: "Partnerships & funding", email: brand.contact.partners, note: "Local organizations, logistics, clinical networks, funders." },
  { name: "Press & media", email: brand.contact.press, note: "Interview requests, imagery, and situation briefings." },
  { name: "Careers", email: brand.contact.careers, note: "Roles across operations, logistics, and recovery programs." },
  { name: "Active response", email: brand.contact.emergency, note: "Field coordination during an activation." },
];

function ContactPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="Contact"
            title="Reach the right desk."
            lede={`${brand.hours}. If you need emergency assistance, use the request form — it routes straight into the operations queue.`}
          />
          <div className="mt-9 flex flex-wrap gap-3">
            <CTAButton to="/request-help" variant="primary">Request help</CTAButton>
            <CTAButton to="/donate" variant="ghost" className="border border-border text-ink hover:bg-surface">
              Give now
            </CTAButton>
          </div>
        </div>
      </div>

      <Section wide>
        <SectionLabel n="01" tone="light">Desks</SectionLabel>
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {desks.map((d) => (
            <li key={d.email} className="grid gap-2 py-6 sm:grid-cols-[1fr_1.2fr_auto] sm:items-center sm:gap-8">
              <h2 className="font-display text-lg font-semibold text-ink">{d.name}</h2>
              <p className="text-sm text-muted-foreground">{d.note}</p>
              <a
                className="justify-self-start text-sm text-primary hover:underline"
                href={`mailto:${d.email}`}
              >
                {d.email}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-px bg-border sm:grid-cols-3">
          <div className="bg-background p-7">
            <p className="rule-label text-muted-foreground">Operations line</p>
            <a
              className="display-cond mt-2 block text-2xl text-ink hover:text-primary"
              href={`tel:${brand.phone.replace(/[^0-9+]/g, "")}`}
            >
              {brand.phone}
            </a>
          </div>
          <div className="bg-background p-7">
            <p className="rule-label text-muted-foreground">Coverage</p>
            <p className="mt-2 text-sm text-foreground/80">{brand.serviceArea}</p>
          </div>
          <div className="bg-background p-7">
            <p className="rule-label text-muted-foreground">Hours</p>
            <p className="mt-2 text-sm text-foreground/80">{brand.hours}</p>
          </div>
        </div>
      </Section>
    </>
  );
}
