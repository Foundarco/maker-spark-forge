import { createFileRoute, notFound } from "@tanstack/react-router";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";

const TRACKS = {
  beginner: {
    title: "Beginner track",
    weeks: 4,
    lede: "Your first successful print — and understanding why it worked.",
    lessons: [
      "Meet your printer: parts and safety",
      "Loading material and running a first-print Mission",
      "Reading a failed print: what went wrong and why",
      "Basic maintenance: keeping the machine happy",
    ],
  },
  intermediate: {
    title: "Intermediate track",
    weeks: 6,
    lede: "Tuning, materials, and multi-part assemblies.",
    lessons: [
      "Slicer settings that actually matter",
      "Material choice: strength vs. finish vs. cost",
      "Designing for print: orientation and supports",
      "Multi-part assemblies and tolerancing",
      "Post-processing: cleanup, sanding, finishing",
      "Troubleshooting like a technician",
    ],
  },
  advanced: {
    title: "Advanced track",
    weeks: 8,
    lede: "Modifying the machine, designing your own parts, teaching others.",
    lessons: [
      "Firmware basics",
      "Designing your own upgrades",
      "Calibration deep dive",
      "Contributing back to the community",
      "Running a class of your own",
      "Field repair scenarios",
      "Materials science, gently",
      "Capstone: teach someone else",
    ],
  },
} as const;

type TrackKey = keyof typeof TRACKS;

export const Route = createFileRoute("/learn/$track")({
  loader: ({ params }) => {
    const t = params.track as TrackKey;
    if (!TRACKS[t]) throw notFound();
    return { track: t };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: `Track — ${brand.name}` }, { name: "robots", content: "noindex" }] };
    const t = TRACKS[loaderData.track];
    return {
      meta: [
        { title: `${t.title} — ${brand.name}` },
        { name: "description", content: t.lede },
        { property: "og:title", content: `${t.title} — ${brand.name}` },
        { property: "og:description", content: t.lede },
      ],
    };
  },
  component: TrackPage,
  notFoundComponent: () => (
    <Section>
      <PageHeader title="Track not found" lede="That track doesn't exist. Head back to the Learning Center." />
    </Section>
  ),
});

function TrackPage() {
  const { track } = Route.useLoaderData();
  const t = TRACKS[track as TrackKey];

    <>
      <Section>
        <PageHeader eyebrow={`Learning Center · ${t.weeks} weeks`} title={t.title} lede={t.lede} />
      </Section>
      <Section className="py-6">
        <ol className="space-y-3">
          {t.lessons.map((l, i) => (
            <Card key={l} as="li" className="flex-row items-start gap-5">
              <span className="font-display text-2xl font-semibold text-primary">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-lg font-semibold">{l}</h3>
                <p className="mt-1 text-sm text-muted-foreground"><Placeholder>[PLACEHOLDER: lesson body — what students do and why.]</Placeholder></p>
              </div>
            </Card>
          ))}
        </ol>
      </Section>
      <Section>
        <Eyebrow>What you'll be able to do</Eyebrow>
        <p className="max-w-2xl text-lg text-muted-foreground">
          <Placeholder>[PLACEHOLDER: outcomes for this track.]</Placeholder>
        </p>
      </Section>
    </>
  );
}
