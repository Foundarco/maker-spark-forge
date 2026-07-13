import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { Placeholder } from "@/components/site/Placeholder";
import { CTAButton } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/mission")({
  head: () => ({
    meta: [
      { title: `Mission & values — ${brand.name}` },
      { name: "description", content: "Why we exist, the five pillars we operate by, and how we think about repair, transparency, and youth STEM." },
      { property: "og:title", content: `Mission & values — ${brand.name}` },
      { property: "og:description", content: "Why we exist, and how we think about repair, transparency, and youth STEM." },
    ],
  }),
  component: MissionPage,
});

function MissionPage() {
  return (
    <>
      <Section>
        <PageHeader
          eyebrow="Mission & values"
          title="Approachable machines. Real education. A community that outlives us."
          lede="These are the ideas we build every decision around."
        />
      </Section>

      <Section className="py-6">
        <div className="space-y-14">
          {brand.pillars.map((p, i) => (
            <div key={p.title} className="grid gap-6 border-t border-border pt-14 md:grid-cols-[auto_1fr] md:gap-14">
              <div className="text-6xl font-display font-semibold text-primary/80">0{i + 1}</div>
              <div>
                <h2 className="text-3xl font-semibold">{p.title}</h2>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{p.body}</p>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                  <Placeholder>
                    [PLACEHOLDER: expand this pillar with a concrete example — a program, a design choice, a story.]
                  </Placeholder>
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>Youth STEM</Eyebrow>
        <h2 className="text-3xl font-semibold sm:text-4xl">Getting more young people making things.</h2>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
          A big part of why we're here: 3D printing is one of the fastest paths from "I have an idea" to "I made a real thing." That loop is powerful for young people learning how the world is built.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { h: "Classroom Missions", b: "Short, guided first-print projects a teacher can drop into a lesson." },
            { h: "Ambassador program", b: "Community members run in-person classes in libraries, schools, and makerspaces." },
            { h: "Open lesson plans", b: "Everything we teach is documented so anyone can pick it up and run with it." },
          ].map((x) => (
            <Card key={x.h}>
              <h3 className="text-lg font-semibold">{x.h}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{x.b}</p>
              <p className="mt-2 text-xs text-muted-foreground"><Placeholder>[PLACEHOLDER: link to real program page]</Placeholder></p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="transparency-card rounded-3xl p-8 sm:p-12">
          <Eyebrow>Transparency & repair</Eyebrow>
          <h2 className="text-3xl font-semibold sm:text-4xl">A note on how we talk about our hardware.</h2>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            We believe hardware should be understandable, repairable, and community-improvable. The exact licensing model
            we ship under is a decision we're still working through carefully.{" "}
            <Placeholder note="Finalize once licensing model is decided">
              [PLACEHOLDER: revisit this section once the hardware licensing model — open source, proprietary, hybrid —
              is locked in. Until then, avoid firm claims like "fully open source".]
            </Placeholder>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CTAButton to="/how-its-built">See how it's built</CTAButton>
            <CTAButton to="/help" variant="secondary">Read repair philosophy</CTAButton>
          </div>
        </div>
      </Section>
    </>
  );
}
