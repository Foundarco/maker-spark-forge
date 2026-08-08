import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { postQuery } from "@/lib/content.queries";
import { Section, PageHeader } from "@/components/site/Section";
import { brand } from "@/config/brand";
import { absoluteUrl } from "@/lib/seo";
import heroAsset from "@/assets/mg-hero.jpg.asset.json";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params, context }) => {
    const p = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!p) throw notFound();
    return {
      slug: params.slug,
      title: p.title as string,
      excerpt: (p.excerpt as string | null) ?? "",
      author: (p.author as string | null) ?? brand.name,
      publishedAt: p.published_at as string,
    };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: `Post — ${brand.name}` }, { name: "robots", content: "noindex" }] };
    const url = `https://clovrlab.com/blog/${params.slug}`;
    const desc = loaderData.excerpt || `${loaderData.title} — build notes from ${brand.name}.`;
    return {
      meta: [
        { title: `${loaderData.title} — ${brand.name}` },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: desc.slice(0, 158) },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: absoluteUrl(heroAsset.url) },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: absoluteUrl(heroAsset.url) },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: loaderData.title,
            description: desc,
            datePublished: loaderData.publishedAt,
            author: { "@type": "Person", name: loaderData.author },
            publisher: { "@type": "Organization", name: brand.name },
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  component: PostPage,
  notFoundComponent: () => (
    <Section>
      <PageHeader title="Post not found" />
      <Link to="/blog" className="text-primary hover:underline">Back to blog →</Link>
    </Section>
  ),
});

function PostPage() {
  const { slug } = Route.useLoaderData();
  const { data: p } = useSuspenseQuery(postQuery(slug));
  if (!p) return null;
  return (
    <article>
      <Section>
        <Link to="/blog" className="text-sm text-primary hover:underline">← All posts</Link>
        <p className="mt-6 text-xs uppercase tracking-widest text-primary">{p.category}</p>
        <h1 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl">{p.title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {p.author} · {new Date(p.published_at).toLocaleDateString()}
        </p>
      </Section>
      <Section className="py-6">
        <div className="prose max-w-2xl text-lg leading-relaxed text-foreground">
          {p.excerpt && <p className="text-xl text-muted-foreground">{p.excerpt}</p>}
          <div className="mt-6 whitespace-pre-line">{p.body}</div>
        </div>
      </Section>
    </article>
  );
}
