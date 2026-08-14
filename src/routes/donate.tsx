import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { CTAButton, CTAButtonA } from "@/components/site/CTAButton";
import { media } from "@/config/system";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const title = `Support the Mission | ${brand.name}`;
const desc =
  "Support an early-stage nonprofit building autonomous wildfire detection and UAV investigation technology. Funding goes to prototype hardware, field testing, and the software behind the Operations Center.";

const uses = [
  { title: "Prototype hardware", body: "Sensor node enclosures, radios, boards, airframe components, and payload sensors on the bench." },
  { title: "Field testing", body: "Getting hardware outside the lab: transport, test sites, instrumentation, and repeat runs." },
  { title: "Software development", body: "Mission control, geospatial tooling, alerting, and the Operations Center stack." },
  { title: "Operations Center", body: "Keeping continuous monitoring and coordination running as the system grows." },
];

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/donate` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/donate` }],
  }),
  component: DonatePage,
});

function DonatePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <img
          src={media.heroImg}
          alt="Prototype UAV over smoke-covered ridgelines"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          width={1920}
          height={1088}
        />
        <div className="scrim-full absolute inset-0" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <PageHeader
            eyebrow="Support the mission"
            title="Fund the prototype, not the press release."
            lede="We are building autonomous wildfire detection and UAV response. Support at this stage buys parts, test days, and engineering time."
          />
        </div>
      </section>

      <Section wide>
        <SectionLabel n="01" tone="light">Where support goes</SectionLabel>
        <ul className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {uses.map((u) => (
            <li key={u.title} className="bg-[var(--night)] px-6 py-7">
              <p className="text-base font-semibold text-ink">{u.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{u.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-muted-foreground">
          We do not publish impact statistics we have not measured. Reporting will describe what was built and tested.
        </p>
      </Section>

      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <SectionLabel n="02" tone="light">Ways to give</SectionLabel>
              <ul className="mt-8 grid gap-px border border-border bg-border">
                {[
                  { k: "One-time gift", v: "Direct support for current prototype and test work." },
                  { k: "Recurring support", v: "Predictable funding that lets us plan test campaigns." },
                  { k: "Equipment & in-kind", v: "Components, tooling, fabrication, or lab access." },
                  { k: "Grants & institutional", v: "Foundation and programme funding for the wildfire system." },
                ].map((r) => (
                  <li key={r.k} className="bg-[var(--night)] px-5 py-4">
                    <p className="text-sm font-semibold text-ink">{r.k}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{r.v}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120} className="flex flex-col justify-center">
              <h2 className="display-cond text-[clamp(1.9rem,4.2vw,3.4rem)] text-ink">Talk to us about giving.</h2>
              <p className="mt-5 text-base text-muted-foreground">
                Online giving is being set up. In the meantime, email us and we will arrange it directly and tell you
                exactly what your support is buying.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <CTAButtonA href={`mailto:${brand.contact.general}`} variant="primary">
                  {brand.contact.general}
                </CTAButtonA>
                <CTAButton to="/development" variant="ghost" className="border border-border text-ink hover:bg-surface">
                  See where we are
                </CTAButton>
              </div>
            </Reveal>
          </div>
        </Section>
      </div>

      <Section wide className="text-center">
        <h2 className="display-cond mx-auto max-w-3xl text-[clamp(2rem,5vw,4rem)] text-ink">
          Other ways to help.
        </h2>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <CTAButton to="/join" variant="primary">Join the team</CTAButton>
          <CTAButton to="/partners" variant="ghost" className="border border-border text-ink hover:bg-surface">
            Partner with us
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
