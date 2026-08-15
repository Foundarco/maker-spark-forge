import { createFileRoute } from "@tanstack/react-router";
import { DisasterReel } from "@/components/site/home/DisasterReel";
import { DisasterStats } from "@/components/site/home/DisasterStats";
import { Escalation } from "@/components/site/home/Escalation";
import { HeroBento } from "@/components/site/home/HeroBento";
import { MissionFlow } from "@/components/site/home/MissionFlow";
import { StoryScroll } from "@/components/site/home/StoryScroll";
import { BuildingBlocks } from "@/components/site/home/BuildingBlocks";
import { JoinBanner } from "@/components/site/home/JoinBanner";
import { Newsroom } from "@/components/site/home/Newsroom";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const title = `${brand.name} — Disaster response, sooner`;
const desc =
  "A nonprofit building sensing, operations software and autonomous aircraft so responders see wildfires, floods and storms sooner.";

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
      <DisasterReel />
      <PinnedStory />
      <DisasterStats />
      <StoryScroll />
      <HeroBento />
      <MissionFlow />
      <BuildingBlocks />
      <JoinBanner />
      <Newsroom />
    </>
  );
}

