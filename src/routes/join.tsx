import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { CTAButton, CTAButtonA } from "@/components/site/CTAButton";
import { involvement, media } from "@/config/system";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const title = `Join the Team — Build Mission 01 | ${brand.name}`;
const desc =
  "Engineers, robotics and software developers, researchers, fire professionals, mentors, sponsors, and manufacturing partners: help build an autonomous wildfire detection and UAV investigation system.";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/join` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/join` }],
  }),
  component: JoinPage,
});

function JoinPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="Get involved"
            title="Build with us."
            lede="We are early, which is the best time to join. There is hardware to design, autonomy to write, data to analyse, and a system architecture that is still being shaped."
          />
        </div>
      </div>

      <Section wide>
        <SectionLabel n="01" tone="light">Who we're looking for</SectionLabel>
        <ul className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {involvement.map((r) => (
            <li key={r.title} className="bg-[var(--night)] px-6 py-7">
              <p className="text-base font-semibold text-ink">{r.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-muted-foreground">
          Roles are a mix of volunteer, project-based, and mentorship depending on the work and your availability.
        </p>
      </Section>

      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
            <Reveal>
              <SectionLabel n="02" tone="light">How to reach us</SectionLabel>
              <h2 className="display-cond mt-6 text-[clamp(2rem,4.6vw,3.4rem)] text-ink">
                Tell us what you'd want to work on.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Email us with what you build, what you'd like to build here, and roughly how much time you have.
                Short is fine — a link to your work is better than a cover letter.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <CTAButtonA href={`mailto:${brand.contact.join}`} variant="primary">
                  {brand.contact.join}
                </CTAButtonA>
                <CTAButton to="/contact" variant="ghost" className="border border-border text-ink hover:bg-surface">
                  Other contacts
                </CTAButton>
              </div>
              <ul className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2">
                <li className="bg-[var(--night)] px-5 py-4">
                  <p className="text-sm font-semibold text-ink">Research collaboration</p>
                  <a className="mt-1 block text-xs text-muted-foreground hover:text-primary" href={`mailto:${brand.contact.research}`}>
                    {brand.contact.research}
                  </a>
                </li>
                <li className="bg-[var(--night)] px-5 py-4">
                  <p className="text-sm font-semibold text-ink">Sponsorship &amp; manufacturing</p>
                  <a className="mt-1 block text-xs text-muted-foreground hover:text-primary" href={`mailto:${brand.contact.partners}`}>
                    {brand.contact.partners}
                  </a>
                </li>
              </ul>
            </Reveal>
            <Reveal delay={120}>
              <img
                src={media.benchImg}
                alt="UAV prototype and electronics on an engineering workbench"
                className="w-full border border-border object-cover"
                loading="lazy"
                width={1600}
                height={1104}
              />
            </Reveal>
          </div>
        </Section>
      </div>

      <Section wide className="text-center">
        <h2 className="display-cond mx-auto max-w-3xl text-[clamp(2rem,5vw,4rem)] text-ink">
          Support the mission another way.
        </h2>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <CTAButton to="/donate" variant="primary">Donate</CTAButton>
          <CTAButton to="/partners" variant="ghost" className="border border-border text-ink hover:bg-surface">
            Partner with us
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
