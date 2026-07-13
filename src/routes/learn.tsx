import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: `Learning Center — ${brand.name}` },
      { name: "description", content: "Courses, Missions, and community-led classes for every level of 3D printer." },
      { property: "og:title", content: `Learning Center — ${brand.name}` },
      { property: "og:description", content: "Courses, Missions, and community-led classes for every level." },
    ],
  }),
  component: LearnPage,
});

const tracks = [
  { slug: "beginner", title: "Beginner", tagline: "Your first successful print — and understanding why it worked.", weeks: "4 weeks" },
  { slug: "intermediate", title: "Intermediate", tagline: "Tuning, materials, and multi-part assemblies.", weeks: "6 weeks" },
  { slug: "advanced", title: "Advanced", tagline: "Modifying the machine, designing your own parts, teaching others.", weeks: "8+ weeks" },
];

function LearnPage() {
  return (
    <>
      <Section>
        <PageHeader
          eyebrow="Learning Center"
          title="Learn 3D printing the way we wish we had."
          lede="Structured tracks, short Missions, and real classes led by real people in your area."
        />
      </Section>

      <Section className="py-6">
        <Eyebrow>Courses</Eyebrow>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {tracks.map((t) => (
            <Card key={t.slug}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{t.weeks}</p>
              <h2 className="mt-1 text-2xl font-semibold">{t.title}</h2>
              <p className="mt-2 text-muted-foreground">{t.tagline}</p>
              <Link to="/learn/$track" params={{ track: t.slug }} className="mt-6 inline-flex text-sm font-medium text-primary hover:underline">
                See the track →
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>Missions</Eyebrow>
        <h2 className="text-3xl font-semibold">Short guided first-print projects.</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A Mission is a single-session project. Pick a mission, follow the guide, print a real thing, keep it forever.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Nameplate", "Cable clip", "Modular desk tray", "Tool caddy"].map((m) => (
            <Card key={m}>
              <div aria-hidden className="aspect-square rounded-xl bg-warm" />
              <h3 className="mt-4 text-base font-semibold">{m}</h3>
              <p className="text-sm text-muted-foreground"><Placeholder>[PLACEHOLDER: 1-line mission description]</Placeholder></p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>Classes near you</Eyebrow>
        <h2 className="text-3xl font-semibold">Ambassador-led classes.</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Community ambassadors teach in-person classes in libraries, schools, and makerspaces around the world.
        </p>
        <div className="mt-8 grid gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex-row items-start justify-between gap-4 sm:flex-row">
              <div>
                <h3 className="text-lg font-semibold"><Placeholder>[Class title]</Placeholder></h3>
                <p className="text-sm text-muted-foreground"><Placeholder>[City]</Placeholder> · <Placeholder>[Date]</Placeholder> · Led by <Placeholder>[Ambassador]</Placeholder></p>
              </div>
              <span className="shrink-0 text-sm text-primary">Details →</span>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Want to teach a class? <Link to="/get-involved" className="text-primary hover:underline">Join the ambassador program</Link>.
        </p>
      </Section>
    </>
  );
}
