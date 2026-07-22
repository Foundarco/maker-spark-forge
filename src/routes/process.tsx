import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { CloudBackdrop } from "@/components/site/CloudBackdrop";
import { brand } from "@/config/brand";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: `Our Process — ${brand.name}` },
      { name: "description", content: "Five steps, no handoffs — how we turn hardware ideas into shipped products." },
      { property: "og:title", content: `Our Process — ${brand.name}` },
      { property: "og:description", content: "Five steps, no handoffs — how we turn hardware ideas into shipped products." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ProcessPage,
});

const steps = [
  {
    n: "01",
    title: "Discovery",
    duration: "1–2 weeks",
    body: "We start with a working session: what's the product, who's the customer, what does success look like? By the end, you have a scoped brief, a milestone plan, and a fixed-fee number.",
    deliverables: ["Product brief & scope", "Feasibility assessment", "Milestone plan & pricing"],
  },
  {
    n: "02",
    title: "Design",
    duration: "3–6 weeks",
    body: "Industrial design and mechanical/electrical engineering happen in parallel. Weekly check-ins with working models — no month-long silences.",
    deliverables: ["Industrial design (CMF)", "CAD & engineering package", "First BOM estimate"],
  },
  {
    n: "03",
    title: "Prototype",
    duration: "1–3 weeks per iteration",
    body: "Working prototypes in your hands within days. We iterate on real hardware — 3D printed housings, CNC parts, and functional PCBs — not renders.",
    deliverables: ["Alpha prototype (looks like)", "Beta prototype (works like)", "DFM prototype (ships like)"],
  },
  {
    n: "04",
    title: "Manufacture",
    duration: "6–16 weeks",
    body: "Tooling, first article inspection, and ramp. We own the factory relationships and give you full visibility into every step.",
    deliverables: ["Tooling & fixtures", "First article approval", "Production ramp"],
  },
  {
    n: "05",
    title: "Ship",
    duration: "Ongoing",
    body: "QA, packaging, and fulfillment. Every unit shipped is logged in the cloud with photos, test data, and traceability.",
    deliverables: ["Retail packaging", "3PL & fulfillment", "Ongoing QA & support"],
  },
];

function ProcessPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <CloudBackdrop variant="dawn" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-8 pt-20 sm:px-8 sm:pt-28">
          <PageHeader
            eyebrow="Our process"
            title={<>Five steps. <span className="text-primary">No handoffs.</span></>}
            lede="Traditional hardware development bounces between an agency, a factory, and a certification lab. We do all three, in one building, on one timeline."
          />
        </div>
      </section>

      <Section wide>
        <ol className="space-y-6">
          {steps.map((s) => (
            <li
              key={s.n}
              className="grid gap-8 rounded-3xl border border-sky-200/60 bg-white p-8 sm:p-10 md:grid-cols-[auto_1fr_1fr] md:gap-14"
            >
              <div>
                <p className="font-display text-5xl font-semibold text-primary">{s.n}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {s.duration}
                </p>
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold text-ink">{s.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Deliverables
                </p>
                <ul className="space-y-2">
                  {s.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section wide>
        <div className="rounded-[2rem] border border-sky-200/60 bg-sky-50/60 px-8 py-14 sm:px-14">
          <Eyebrow>Ready to start?</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Tell us about your project. We'll come back with scope, timeline, and price within a week.
          </h2>
          <div className="mt-8">
            <CTAButton to="/quote" variant="primary">
              Request a quote <ArrowRight className="h-4 w-4" />
            </CTAButton>
          </div>
        </div>
      </Section>
    </>
  );
}
