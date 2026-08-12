import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { CTAButton, CTAButtonA } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const title = `Partners — Research, Industry & Fire Service | ${brand.name}`;
const desc =
  "Research partnerships, manufacturing and component partners, fire-service advisors, and sponsors supporting an early-stage wildfire detection and UAV investigation programme.";

const tracks = [
  {
    n: "01",
    title: "Research partnership",
    body: "Universities, labs, and independent researchers working on detection methods, remote sensing, autonomy, or evaluation methodology. We are interested in collaborators who will hold our claims to a standard.",
    ask: "Joint studies, shared datasets, review of detection approaches, student projects.",
    email: brand.contact.research,
  },
  {
    n: "02",
    title: "Fire service & response advisors",
    body: "Fire professionals and agencies willing to tell us what information is actually useful, in what form, and at what moment. Design input now is worth more than a pilot later.",
    ask: "Advisory conversations, requirements review, eventual supervised evaluation.",
    email: brand.contact.partners,
  },
  {
    n: "03",
    title: "Manufacturing & components",
    body: "Fabrication, enclosures, PCB assembly, airframe components, batteries, and small-batch production support for prototype and field-test hardware.",
    ask: "In-kind supply, discounted production runs, engineering support.",
    email: brand.contact.partners,
  },
  {
    n: "04",
    title: "Sponsors & funders",
    body: "Foundations, companies, and individuals funding a system that is being built in the open, with an honest development timeline attached to it.",
    ask: "Programme funding, equipment sponsorship, grants.",
    email: brand.contact.partners,
  },
] as const;

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

function PartnersPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="Partners"
            title="Partner with us on Mission 01."
            lede="We do not list partners we do not have. These are the four tracks where collaboration would move the wildfire system forward right now."
          />
        </div>
      </div>

      <Section wide>
        <ul className="grid gap-px border border-border bg-border lg:grid-cols-2">
          {tracks.map((t) => (
            <li key={t.n} className="bg-[var(--night)]">
              <Reveal className="flex h-full flex-col px-7 py-9">
                <span className="display-cond text-[clamp(2rem,3.6vw,3rem)] text-[var(--signal)]">{t.n}</span>
                <h2 className="mt-3 text-xl font-semibold text-ink">{t.title}</h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{t.body}</p>
                <p className="mt-5 border-t border-border pt-4 text-sm text-foreground/80">
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                    What helps
                  </span>
                  <br />
                  {t.ask}
                </p>
                <a
                  href={`mailto:${t.email}`}
                  className="mt-5 text-sm text-foreground/80 underline underline-offset-4 hover:text-primary"
                >
                  {t.email}
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <SectionLabel n="05" tone="light">What you should know first</SectionLabel>
              <ul className="mt-8 space-y-3 text-base text-muted-foreground">
                {[
                  "The system is in development; nothing is deployed operationally.",
                  "We publish an honest development timeline and update it as stages move.",
                  "We do not publish performance figures we have not measured.",
                  "Our Operations Center runs 24/7/365 and is the coordination point for everything.",
                ].map((x) => (
                  <li key={x} className="flex gap-3">
                    <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--signal)]" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120} className="flex flex-col justify-center">
              <h2 className="display-cond text-[clamp(1.9rem,4vw,3.2rem)] text-ink">Start a conversation.</h2>
              <div className="mt-8 flex flex-wrap gap-3">
                <CTAButtonA href={`mailto:${brand.contact.partners}`} variant="primary">
                  {brand.contact.partners}
                </CTAButtonA>
                <CTAButton to="/system" variant="ghost" className="border border-border text-ink hover:bg-surface">
                  Review the architecture
                </CTAButton>
              </div>
            </Reveal>
          </div>
        </Section>
      </div>
    </>
  );
}
