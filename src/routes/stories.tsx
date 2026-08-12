import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, PageHeader } from "@/components/site/Section";
import { stories } from "@/config/programs";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";
import { ArrowUpRight } from "lucide-react";

const desc =
  "Field stories from Clovr Relief deployments — flash flooding in Appalachia, hurricane recovery in the Caribbean, and tornado response across the Northern Plains.";
const title = `Field Stories — ${brand.name}`;

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/stories` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/stories` }],
  }),
  component: StoriesPage,
});

function StoriesPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="From the field"
            title="What a response actually looks like."
            lede="Accounts written by the teams who were there, with the numbers attached."
          />
        </div>
      </div>

      <Section wide>
        <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => (
            <Link
              key={s.slug}
              to="/stories/$slug"
              params={{ slug: s.slug }}
              className="group flex flex-col bg-background transition-colors hover:bg-surface"
            >
              <div className="overflow-hidden">
                <img
                  src={s.image}
                  alt={s.imageAlt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="rule-label text-muted-foreground">{s.place} · {s.year}</p>
                <h2 className="mt-3 font-display text-xl font-bold text-ink">{s.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Read <ArrowUpRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
