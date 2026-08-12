import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { stories } from "@/config/programs";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/stories/$slug")({
  loader: ({ params }) => {
    const story = stories.find((s) => s.slug === params.slug);
    if (!story) throw notFound();
    return { story };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: `Story not found — ${brand.name}` }, { name: "robots", content: "noindex" }],
      };
    }
    const { story } = loaderData;
    const title = `${story.title} — ${brand.name}`;
    return {
      meta: [
        { title },
        { name: "description", content: story.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: story.summary },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `${SITE_URL}/stories/${story.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/stories/${story.slug}` }],
    };
  },
  notFoundComponent: StoryNotFound,
  component: StoryPage,
});

function StoryNotFound() {
  return (
    <Section wide>
      <h1 className="display-cond text-4xl text-ink">Story not found</h1>
      <p className="mt-4 text-muted-foreground">This account may have moved.</p>
      <div className="mt-8">
        <CTAButton to="/stories" variant="primary">All stories</CTAButton>
      </div>
    </Section>
  );
}

function StoryPage() {
  const { story } = Route.useLoaderData();
  return (
    <article>
      <section className="relative isolate overflow-hidden border-b border-border">
        <img src={story.image} alt={story.imageAlt} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-[var(--night)]/80" aria-hidden />
        <div className="mx-auto w-full max-w-4xl px-5 py-24 sm:px-8 sm:py-32">
          <p className="rule-label text-[var(--aid)]">{story.place} · {story.year}</p>
          <h1 className="display-cond mt-5 text-[clamp(2.25rem,7vw,5rem)] text-ink">{story.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/80">{story.summary}</p>
        </div>
      </section>

      <Section>
        <dl className="grid gap-px bg-border sm:grid-cols-3">
          {story.metrics.map((m) => (
            <div key={m.label} className="bg-background p-6">
              <dt className="rule-label text-muted-foreground">{m.label}</dt>
              <dd className="display-cond mt-2 text-3xl text-ink">{m.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-14 max-w-2xl space-y-6">
          {story.body.map((p) => (
            <p key={p} className="text-lg leading-relaxed text-foreground/80">{p}</p>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap gap-3">
          <CTAButton to="/donate" variant="primary">Support the next response</CTAButton>
          <Link
            to="/stories"
            className="inline-flex items-center px-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:text-[var(--aid)]"
          >
            All stories
          </Link>
        </div>
      </Section>
    </article>
  );
}
