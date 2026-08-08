import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { processSteps } from "@/config/site-content";
import { ArrowRight } from "lucide-react";
import plansAsset from "@/assets/mg-plans.jpg.asset.json";

const desc =
  "How McGuire Construction runs a job: site assessment, line-item estimate, milestone schedule, weekly updates, documented change orders, inspections, and a written warranty.";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: `Our Process — ${brand.name}` },
      { name: "description", content: desc },
      { property: "og:title", content: `Our Process — ${brand.name}` },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clovrlab.com/process" },
      { property: "og:image", content: plansAsset.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: plansAsset.url },
    ],
    links: [{ rel: "canonical", href: "https://clovrlab.com/process" }],
  }),
  component: ProcessPage,
});

const commitments = [
  { label: "Response to new inquiries", value: "2 business days" },
  { label: "Written progress updates", value: "Weekly" },
  { label: "Change orders approved in writing", value: "Always" },
  { label: "Site cleaned at end of day", value: "Every day" },
];

function ProcessPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <PageHeader
            eyebrow="Process"
            title="Predictable by design."
            lede="Construction goes wrong in the gaps — between the estimate and the contract, the contract and the crew, the crew and the client. We closed those gaps with a sequence we run every time."
          />
          <img
            src={plansAsset.url}
            alt="Construction drawings, a tape measure and a level on a work table"
            width={1600}
            height={1200}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      </div>

      <Section wide>
        <ol className="border-t border-border">
          {processSteps.map((s) => (
            <li key={s.n} className="grid gap-6 border-b border-border py-10 md:grid-cols-[7rem_1fr_1.4fr]">
              <p className="font-display text-3xl font-bold text-ink/25">{s.n}</p>
              <h2 className="font-display text-xl font-bold text-ink">{s.title}</h2>
              <p className="text-base leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <section className="border-y border-border bg-warm">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
          <h2 className="rule-label text-muted-foreground">Our standing commitments</h2>
          <dl className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {commitments.map((c) => (
              <div key={c.label} className="bg-card p-8">
                <dt className="text-sm text-muted-foreground">{c.label}</dt>
                <dd className="mt-3 font-display text-xl font-bold text-ink">{c.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Section wide>
        <div className="grid gap-10 bg-ink px-8 py-16 text-white sm:px-14 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="rule-label text-white/50">Next step</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Step one is a conversation. It costs nothing.
            </h2>
          </div>
          <div className="lg:justify-self-end">
            <CTAButton to="/contact" variant="light">
              Request an estimate <ArrowRight className="h-4 w-4" />
            </CTAButton>
          </div>
        </div>
      </Section>
    </>
  );
}
