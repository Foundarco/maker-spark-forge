import { createFileRoute } from "@tanstack/react-router";
import { FilmHero } from "@/components/site/home/FilmHero";
import { Statement } from "@/components/site/home/Statement";
import { ScrollStory } from "@/components/site/home/ScrollStory";
import { QuoteBanner } from "@/components/site/home/QuoteBanner";
import { HowItWorks } from "@/components/site/home/HowItWorks";
import { FlyBanner } from "@/components/site/home/FlyBanner";
import { ImpactCards } from "@/components/site/home/ImpactCards";
import { Newsroom } from "@/components/site/home/Newsroom";
import { CTAButton } from "@/components/site/CTAButton";
import { Section } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";


const title = `${brand.name} — See the fire sooner`;
const desc = brand.mission;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NGO",
          name: brand.legalName,
          url: `${SITE_URL}/`,
          slogan: brand.tagline,
          description: desc,
          email: brand.contact.general,
        }),
      },
    ],
  }),
  component: HomePage,
});


function HomePage() {
  return (
    <>
      <FilmHero />
      <Statement />
      <SplitPanels />
      <QuoteBanner />
      <HowItWorks />
      <FlyBanner />
      <ImpactCards />
      <Newsroom />

      <Section wide className="bg-[var(--night)] text-center">
        <Reveal>
          <h2 className="display-cond mx-auto max-w-4xl text-[clamp(2.2rem,6vw,5rem)] text-ink">
            Build Mission 01 with us.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            {brand.shortMission}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <CTAButton to="/donate" variant="primary">Support the mission</CTAButton>
            <CTAButton to="/join" variant="ghost" className="border border-border text-ink hover:bg-surface">
              Build with us
            </CTAButton>
            <CTAButton to="/partners" variant="ghost" className="border border-border text-ink hover:bg-surface">
              Partner with us
            </CTAButton>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
