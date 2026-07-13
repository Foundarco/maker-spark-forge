import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { guideQuery } from "@/lib/content.queries";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/help/$slug")({
  loader: async ({ params, context }) => {
    const guide = await context.queryClient.ensureQueryData(guideQuery(params.slug));
    if (!guide) throw notFound();
    return { slug: params.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: `Guide — ${brand.name}` }, { name: "robots", content: "noindex" }] };
    return { meta: [{ title: `Guide · ${loaderData.slug} — ${brand.name}` }] };
  },
  component: GuidePage,
  notFoundComponent: () => (
    <Section>
      <PageHeader title="Guide not found" lede="That guide doesn't exist yet." />
      <Link to="/help" className="text-primary hover:underline">Back to Help →</Link>
    </Section>
  ),
});

type Step = { title: string; body: string };

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
              <Eyebrow>Overview</Eyebrow>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{guide.body}</p>
            </Card>
          </aside>
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <Card key={i} as="li">
                <p className="font-display text-2xl font-semibold text-primary">Step {i + 1}</p>
                <h2 className="mt-1 text-xl font-semibold">{s.title}</h2>
                <p className="mt-2 text-muted-foreground">{s.body}</p>
                <div aria-hidden className="mt-4 aspect-video rounded-xl bg-warm text-center text-xs text-muted-foreground">
                  <div className="grid h-full place-items-center">[PLACEHOLDER photo / short video for this step]</div>
                </div>
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
