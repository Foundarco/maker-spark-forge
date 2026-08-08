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

const groups: { title: string; items: [string, string][] }[] = [
  {
    title: "Estimates & pricing",
    items: [
      [
        "How do you build an estimate?",
        "We walk the site, take measurements, and price the work line by line — labor, materials, equipment, permits, and disposal are each listed separately. You get a written scope alongside the number so you can see exactly what is and isn't included.",
      ],
      [
        "Is the estimate free?",
        "Yes. The site visit and written estimate are free for projects in our service area. For design-heavy remodels that need drawings before anyone can price them accurately, we'll quote a separate design fee up front and credit it toward the build if you move forward.",
      ],
      [
        "How firm is the price?",
        "Fixed-price for everything in the written scope. The number only changes through a signed change order — typically for owner-requested additions or genuine unknowns behind a wall, like failed framing or out-of-code wiring.",
      ],
      [
        "What does the payment schedule look like?",
        "A deposit at contract signing, then progress payments tied to completed milestones such as demo, rough-in, and drywall, with a final payment after the punch list is signed off. No large payments are due before matching work is finished.",
      ],
    ],
  },
  {
    title: "Schedule & timeline",
    items: [
      [
        "How long will my project take?",
        "A bathroom typically runs three to five weeks, a kitchen six to ten, and an addition three to six months depending on size and permitting. You get a published schedule before we start, and we track against it weekly.",
      ],
      [
        "How far out are you booking?",
        "Most projects start four to eight weeks after the contract is signed. Emergency repairs and warranty work for past clients are handled sooner.",
      ],
      [
        "Will crews be on site every day?",
        "Yes, during active phases. Our crews are in-house rather than day-to-day subs, so we don't disappear mid-project to chase another job. Inspection waits are the main scheduled pause, and they're marked on your schedule ahead of time.",
      ],
    ],
  },
  {
    title: "Permits, change orders & the job site",
    items: [
      [
        "Do you handle permits and inspections?",
        "We pull the permits, coordinate with the building department, and meet every inspector on site. Permit fees are shown as a separate line on your estimate rather than buried in the labor number.",
      ],
      [
        "How are change orders handled?",
        "In writing, before the work happens. Each one states the added scope, the cost, and the schedule impact, and it needs your signature. You'll never see a surprise charge on the final invoice.",
      ],
      [
        "How do you keep the site livable?",
        "Dust barriers at work-area boundaries, floor protection on every path, daily cleanup, and a locked dumpster or bin. For occupied homes we agree on working hours and bathroom and entry access before day one.",
      ],
      [
        "Are you licensed and insured?",
        "Yes — general liability and workers' compensation, with certificates sent directly to you before work begins. Every crew member on your property works for us or for a subcontractor carrying the same coverage.",
      ],
    ],
  },
  {
    title: "Warranty & after the build",
    items: [
      [
        "What's the warranty?",
        "One year of full workmanship coverage from substantial completion, on top of whatever the manufacturer warranties cover for materials and appliances. Structural work carries longer coverage, spelled out in your contract.",
      ],
      [
        "How do I make a warranty claim?",
        "Submit it through the help center or call the office. We schedule an assessment within a few business days, and warranty visits are prioritized ahead of new work.",
      ],
      [
        "Do you come back for punch-list items?",
        "Always. We walk the finished project with you, write the punch list together, and complete it before requesting final payment.",
      ],
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
              <Eyebrow as="h2">{g.title}</Eyebrow>
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
