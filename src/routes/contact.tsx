import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { CTAButton } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const title = `Contact | ${brand.name}`;
const desc =
  "Contact Clovr Labs — general enquiries, press, research collaboration, partnerships, and joining the team on Mission 01: wildfire detection and UAV investigation.";

const desks = [
  { k: "General", email: brand.contact.general, note: "Anything that doesn't fit elsewhere." },
  { k: "Join the team", email: brand.contact.join, note: "Engineers, developers, researchers, volunteers, mentors." },
  { k: "Research", email: brand.contact.research, note: "Collaborations, studies, datasets, and methodology." },
  { k: "Partnerships", email: brand.contact.partners, note: "Fire service advisors, manufacturing, sponsors, funders." },
  { k: "Press", email: brand.contact.press, note: "Media enquiries about the programme and its status." },
];

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

function ContactPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="Contact"
            title="Reach the right desk."
            lede="We're a small team building Mission 01. Email is the fastest way to reach us."
          />
        </div>
      </div>

      <Section wide>
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <SectionLabel n="01" tone="light">Desks</SectionLabel>
            <ul className="mt-8 grid gap-px border border-border bg-border">
              {desks.map((d) => (
                <li key={d.k} className="grid gap-2 bg-[var(--night)] px-6 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <p className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-muted-foreground">{d.k}</p>
                  <div>
                    <a href={`mailto:${d.email}`} className="text-base text-ink hover:text-primary">
                      {d.email}
                    </a>
                    <p className="mt-1 text-xs text-muted-foreground">{d.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <SectionLabel n="02" tone="light">Emergencies</SectionLabel>
            <div className="mt-8 border border-border bg-[var(--night)] px-6 py-6">
              <p className="text-base leading-relaxed text-foreground/85">
                We are not an emergency service. If you are reporting a fire or any emergency, contact your local
                emergency number and fire authority immediately.
              </p>
            </div>
            <div className="mt-8 border border-border bg-[var(--night)] px-6 py-6">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
                Operations Center
              </p>
              <p className="mt-3 text-base text-ink">{brand.hours}</p>
              <p className="mt-2 text-sm text-muted-foreground">{brand.status} · {brand.mission01}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton to="/join" variant="primary">Join the team</CTAButton>
              <CTAButton to="/partners" variant="ghost" className="border border-border text-ink hover:bg-surface">
                Partner with us
              </CTAButton>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
