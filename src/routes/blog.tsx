import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { postsQuery } from "@/lib/content.queries";
import { Section, PageHeader } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/blog")({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  head: () => ({
    meta: [
      { title: `The Job Site Journal — Build Notes | ${brand.name}` },
      { name: "description", content: "Notes from McGuire job sites: how we sequence a build, what materials we specify, division updates, and lessons from thirty years of residential construction." },
      { property: "og:title", content: `The Job Site Journal | ${brand.name}` },
      { property: "og:description", content: "Build notes, material choices, and division updates from McGuire crews." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clovrlab.com/blog" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://clovrlab.com/blog" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `The Job Site Journal — ${brand.name}`,
          description: "Build notes, material choices, and division updates from McGuire crews.",
          url: "https://clovrlab.com/blog",
          publisher: { "@type": "Organization", name: brand.name },
        }),
      },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { data: posts } = useSuspenseQuery(postsQuery);
  return (
    <>
      <Section>
        <PageHeader eyebrow="Blog" title="Build updates, community, education, company news." />
      </Section>
      <Section className="py-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Card key={p.slug} as="article">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.category}</p>
              <h2 className="mt-2 text-lg font-semibold leading-snug">
                <Link to="/blog/$slug" params={{ slug: p.slug }} className="hover:underline">{p.title}</Link>
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                {p.author} · {new Date(p.published_at).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
