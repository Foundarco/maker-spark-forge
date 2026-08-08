import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { guideQuery } from "@/lib/content.queries";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { brand } from "@/config/brand";
import { absoluteUrl } from "@/lib/seo";
import heroAsset from "@/assets/mg-hero.jpg.asset.json";

type Step = { title: string; body: string };

export const Route = createFileRoute("/help/$slug")({
  loader: async ({ params, context }) => {
    const guide = await context.queryClient.ensureQueryData(guideQuery(params.slug));
    if (!guide) throw notFound();
    return {
      slug: params.slug,
      title: guide.title as string,
      symptom: (guide.symptom as string | null) ?? "",
      body: (guide.body as string | null) ?? "",
      steps: (Array.isArray(guide.steps) ? (guide.steps as unknown as Step[]) : []) ?? [],
    };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: `Guide — ${brand.name}` }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.title} — Homeowner Guide | ${brand.name}`;
    const raw = loaderData.symptom || loaderData.body || `Step-by-step homeowner guide from ${brand.name}.`;
    const description = (raw.length < 50 ? `${raw} A step-by-step homeowner guide from ${brand.name}.` : raw).slice(0, 158);
    const url = `https://clovrlab.com/help/${params.slug}`;
    const image = absoluteUrl(heroAsset.url);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: loaderData.title,
            description,
            url,
            step: loaderData.steps.map((s, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: s.title,
              text: s.body,
            })),
          }),
        },
      ],
    };
  },
  component: GuidePage,
  notFoundComponent: () => (
    <Section>
      <PageHeader title="Guide not found" lede="That guide doesn't exist yet." />
      <Link to="/help" className="text-primary hover:underline">Back to Help →</Link>
    </Section>
  ),
});

function GuidePage() {
  const { slug } = Route.useLoaderData();
  const { data: guide } = useSuspenseQuery(guideQuery(slug));
  if (!guide) return null;
  const steps = (Array.isArray(guide.steps) ? (guide.steps as unknown as Step[]) : []) ?? [];

  return (
    <>
      <Section>
        <Link to="/help" className="text-sm text-primary hover:underline">← All guides</Link>
        <PageHeader
          eyebrow={`${guide.category} · ${guide.difficulty}`}
          title={guide.title}
          lede={guide.symptom ?? undefined}
        />
      </Section>

      <Section className="py-6">
        <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
          <aside className="md:sticky md:top-24 md:self-start">
            <Card>
              <Eyebrow as="h2">Overview</Eyebrow>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{guide.body}</p>
            </Card>
          </aside>
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <Card key={i} as="li">
                <p className="font-display text-2xl font-semibold text-primary">Step {i + 1}</p>
                <h2 className="mt-1 text-xl font-semibold">{s.title}</h2>
                <p className="mt-2 text-muted-foreground">{s.body}</p>
              </Card>
            ))}
          </ol>
        </div>
      </Section>

      <Section>
        <div className="rounded-3xl bg-warm p-8">
          <h2 className="text-2xl font-semibold">Did this fix it?</h2>
          <p className="mt-2 text-muted-foreground">
            If not, <Link to="/contact" className="text-primary hover:underline">tell support what you tried</Link> and we'll take it from there.
          </p>
        </div>
      </Section>
    </>
  );
}
