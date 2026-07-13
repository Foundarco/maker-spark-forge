import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/how-its-built")({
  head: () => ({
    meta: [
      { title: `How it's built — ${brand.name}` },
      { name: "description", content: "A full construction breakdown: frame, motion, electronics, printed parts — and how to repair every one." },
      { property: "og:title", content: `How it's built — ${brand.name}` },
      { property: "og:description", content: "Frame, motion, electronics, printed parts, and repair philosophy." },
    ],
  }),
  component: HowPage,
});

const systems = [
  { name: "Frame", body: "Extruded aluminum. Standard hardware. Squared and repeatable.", details: ["[PLACEHOLDER extrusion profile]", "[PLACEHOLDER frame dimensions]", "Standard M-series fasteners throughout"] },
  { name: "Motion system", body: "CoreXY layout. Linear rails on high-load axes. Belts you can retension in the field.", details: ["[PLACEHOLDER motor spec]", "[PLACEHOLDER belt spec]", "Documented tensioning routine"] },
  { name: "Electronics", body: "Community-friendly controller with headers exposed. Nothing hidden under glue.", details: ["[PLACEHOLDER MCU]", "[PLACEHOLDER firmware fork]", "All connectors labeled"] },
  { name: "Printed parts", body: "All printer-printed parts are available as STLs. Print your own upgrades and spares.", details: ["[PLACEHOLDER CAD link]", "[PLACEHOLDER STL folder]", "Suggested materials for each part"] },
];

function HowPage() {
  return (
    <>
      <Section>
        <PageHeader
          eyebrow="How it's built"
          title="The whole machine, with nothing hidden."
          lede="The best way to trust a tool is to understand how it works. Here's ours, part by part."
        />
      </Section>

      <Section className="py-6">
        <div className="grid gap-4 md:grid-cols-2">
          {systems.map((s) => (
            <Card key={s.name}>
              <h2 className="text-xl font-semibold">{s.name}</h2>
              <p className="mt-2 text-muted-foreground">{s.body}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {s.details.map((d) => (
                  <li key={d} className="flex gap-2"><span className="text-primary">—</span> <Placeholder>{d}</Placeholder></li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>Documentation</Eyebrow>
        <h2 className="text-3xl font-semibold sm:text-4xl">CAD, build docs, and BOMs.</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          We're structuring build documentation to support public access. Links below are placeholders until the licensing model is finalized.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { h: "CAD files", b: "Full assembly + individual parts." },
            { h: "Build guide", b: "Illustrated, step-by-step assembly." },
            { h: "BOM", b: "Everything you need to build one, with sources." },
          ].map((x) => (
            <Card key={x.h}>
              <h3 className="text-lg font-semibold">{x.h}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{x.b}</p>
              <p className="mt-4 text-sm text-primary"><Placeholder>[PLACEHOLDER link]</Placeholder></p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="transparency-card rounded-3xl p-8 sm:p-12">
          <Eyebrow>Repair philosophy</Eyebrow>
          <h2 className="text-3xl font-semibold sm:text-4xl">If it breaks, you can fix it. And we'll show you how.</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Every common failure has a guide. Every consumable has a source. Every printed part has a downloadable STL. The Help Center works like a symptom-first repair manual — start with what's wrong, end with the fix.
          </p>
          <a href="/help" className="mt-6 inline-flex text-sm font-medium text-primary hover:underline">
            Open the Help Center →
          </a>
        </div>
      </Section>

      <Section>
        <Eyebrow>Upgrade parts</Eyebrow>
        <h2 className="text-3xl font-semibold">Parts you can print yourself.</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A curated list of community-tested upgrades — fan ducts, cable managers, tool holders. All printable on the machine you already own.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          <Placeholder>[PLACEHOLDER: link out to a real STL library / model-sharing repository once chosen.]</Placeholder>
        </p>
        <p className="mt-8 text-xs text-muted-foreground">Manufactured, documented, and supported by {brand.name}.</p>
      </Section>
    </>
  );
}
