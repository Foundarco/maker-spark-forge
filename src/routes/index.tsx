import { createFileRoute } from "@tanstack/react-router";
import { MissionStory } from "@/components/site/film/MissionStory";
import { ImpactCards } from "@/components/site/home/ImpactCards";
import { Newsroom } from "@/components/site/home/Newsroom";
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
      <MissionStory />
      <ImpactCards />
      <Newsroom />
    </>
  );
}
