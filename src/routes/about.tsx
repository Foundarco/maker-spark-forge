import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${brand.name}` },
      { name: "description", content: `The origin story, mission, and people behind ${brand.name}.` },
      { property: "og:title", content: `About — ${brand.name}` },
      { property: "og:description", content: `The origin story, mission, and people behind ${brand.name}.` },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <Section>
        <PageHeader
          eyebrow="About"
          title="We started this to make 3D printing feel like something you can actually learn."
          lede="This is the honest story of what we're building, why it exists, and who it's for."
        />
      </Section>

      <Section className="py-6">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div className="transparency-card aspect-[4/5] rounded-3xl">
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              <Placeholder>[PLACEHOLDER founder photo]</Placeholder>
            </div>
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-foreground">
            <Eyebrow>Origin story</Eyebrow>
            <p>
              <Placeholder>
                [PLACEHOLDER: Replace with the real founder story — background, why 3D printing, why community-first, what
                the first prototype felt like. Keep it personal and honest, not corporate-speak.]
              </Placeholder>
            </p>
            <p>
              <Placeholder>
                [PLACEHOLDER: Second paragraph — what changed along the way, who joined, what the mission became.]
              </Placeholder>
            </p>
            <p>
              <Placeholder>
                [PLACEHOLDER: Third paragraph — where we are today and what's next.]
              </Placeholder>
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow>Our mission</Eyebrow>
        <blockquote className="max-w-3xl text-3xl font-semibold leading-snug text-ink sm:text-4xl">
          "{brand.shortMission}" <Placeholder note="Confirm final mission wording">[confirm]</Placeholder>
        </blockquote>
      </Section>

      <Section>
        <Eyebrow>Our pillars</Eyebrow>
        <h2 className="mb-10 text-3xl font-semibold sm:text-4xl">Five things we won't compromise on.</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {brand.pillars.map((p, i) => (
            <Card key={p.title}>
              <p className="text-xs font-medium text-primary">0{i + 1}</p>
              <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>The team</Eyebrow>
        <h2 className="mb-8 text-3xl font-semibold">The people making this real.</h2>
        <p className="max-w-2xl text-muted-foreground">
          <Placeholder>
            [PLACEHOLDER team section — keep flexible for staff, contractors, or volunteers depending on final org
            structure. Add names, roles, short bios, and photos as they come in.]
          </Placeholder>
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <div className="aspect-square rounded-xl bg-warm" />
              <h3 className="mt-4 text-base font-semibold"><Placeholder>[PLACEHOLDER name]</Placeholder></h3>
              <p className="text-sm text-muted-foreground"><Placeholder>[role]</Placeholder></p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
