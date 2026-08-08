import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `Homeowner FAQ — Estimates, Timelines & Warranty | ${brand.name}` },
      { name: "description", content: "Answers to the questions homeowners ask most: how estimates are built, what a realistic timeline looks like, change orders, permits, payment schedules, and our warranty." },
      { property: "og:title", content: `Homeowner FAQ | ${brand.name}` },
      { property: "og:description", content: "Estimates, timelines, change orders, permits, payments, and warranty — answered plainly." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clovrlab.com/faq" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://clovrlab.com/faq" }],
  }),
  component: FAQPage,
});

const groups = [
  {
    title: "The printer",
    items: [
      ["What can it print?", "[PLACEHOLDER answer]"],
      ["How loud is it?", "[PLACEHOLDER answer]"],
      ["Does it need a special room?", "[PLACEHOLDER answer]"],
      ["How hard is assembly?", "[PLACEHOLDER answer]"],
    ],
  },
  {
    title: "Ordering & shipping",
    items: [
      ["Where do you ship?", "[PLACEHOLDER answer]"],
      ["How long does delivery take?", "[PLACEHOLDER answer]"],
      ["Can I order for a school or district?", "[PLACEHOLDER answer]"],
    ],
  },
  {
    title: "Materials",
    items: [
      ["Which materials work?", "[PLACEHOLDER answer]"],
      ["Am I locked into your pellets?", "[PLACEHOLDER answer — but the short answer is no.]"],
    ],
  },
  {
    title: "Warranty & support",
    items: [
      ["What's the warranty?", "1 year, full coverage. See the full warranty page for details."],
      ["What if a part fails after warranty?", "[PLACEHOLDER answer — repairable, replacement parts available.]"],
    ],
  },
];

function FAQPage() {
  return (
    <>
      <Section>
        <PageHeader eyebrow="FAQ" title="The questions we hear most." />
      </Section>
      <Section className="py-6">
        <div className="space-y-12">
          {groups.map((g) => (
            <div key={g.title}>
              <Eyebrow>{g.title}</Eyebrow>
              <div className="mt-4 space-y-3">
                {g.items.map(([q, a]) => (
                  <Card key={q}>
                    <details className="group">
                      <summary className="cursor-pointer list-none text-lg font-semibold">
                        <span className="flex items-center justify-between gap-4">
                          {q}
                          <span aria-hidden className="text-primary transition group-open:rotate-45">＋</span>
                        </span>
                      </summary>
                      <p className="mt-3 text-muted-foreground">{a}</p>
                    </details>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
