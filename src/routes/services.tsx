import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { CTAButton } from "@/components/site/CTAButton";
import { CloudBackdrop } from "@/components/site/CloudBackdrop";
import { brand } from "@/config/brand";
import { Sparkles, Layers, Factory, Cpu, ShieldCheck, Package, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: `Services — ${brand.name}` },
      { name: "description", content: "Product development, prototyping, and manufacturing — one team, end to end." },
      { property: "og:title", content: `Services — ${brand.name}` },
      { property: "og:description", content: "Product development, prototyping, and manufacturing — one team, end to end." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    icon: Sparkles,
    title: "Product Development",
    body: "Industrial design, mechanical engineering, and human-factors research. We turn a rough idea into a manufacturable product.",
    includes: ["Concept sketching & mood boards", "Industrial design & CMF", "Mechanical engineering (CAD)", "Design for manufacturability (DFM)"],
  },
  {
    icon: Layers,
    title: "Prototyping",
    body: "In-house rapid prototyping. See your idea, hold it, break it, iterate — all in the same week.",
    includes: ["FDM & SLA 3D printing", "CNC machining (aluminum, plastics)", "Vacuum casting for soft parts", "PCB assembly & bring-up"],
  },
  {
    icon: Cpu,
    title: "Electronics & Firmware",
    body: "Full-stack hardware: from schematic to shipping firmware. Connectivity, sensors, power — we've done all of it.",
    includes: ["Schematic capture & PCB layout", "Embedded firmware (C, Rust, MicroPython)", "Wireless (BLE, Wi-Fi, LoRa, Cellular)", "Power & battery engineering"],
  },
  {
    icon: Factory,
    title: "Manufacturing",
    body: "Tooling, first article, ramp, and QA. We own the factory relationships so you don't have to.",
    includes: ["Injection mold tooling", "Assembly line design", "Incoming/outgoing QA", "Ramp from 100 to 100,000 units"],
  },
  {
    icon: ShieldCheck,
    title: "Certification & Compliance",
    body: "FCC, CE, UL, RoHS, and everything else. We manage labs, filings, and rework.",
    includes: ["Pre-scan & lab coordination", "FCC / CE / IC filings", "UL & safety compliance", "RoHS & material declarations"],
  },
  {
    icon: Package,
    title: "Packaging & Fulfillment",
    body: "Retail-ready packaging, warehousing, and shipping — direct to customers or into your channel.",
    includes: ["Retail packaging design", "Kitting & sub-assembly", "3PL integration", "Global shipping & duties"],
  },
];

function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <CloudBackdrop variant="soft" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-8 pt-20 sm:px-8 sm:pt-28">
          <PageHeader
            eyebrow="Services"
            title={<>A full hardware team, <span className="text-primary">on demand.</span></>}
            lede="From the first sketch to the last shipment, one team handles everything. No agencies. No sourcing. No handoffs."
          />
        </div>
      </section>

      <Section wide>
        <div className="grid gap-5 md:grid-cols-2">
          {services.map((s) => (
            <Card key={s.title}>
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              <ul className="mt-5 space-y-1.5">
                {s.includes.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {i}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section wide>
        <div className="rounded-[2rem] border border-sky-200/60 bg-sky-50/60 px-8 py-14 sm:px-14">
          <Eyebrow>Not sure where to start?</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Tell us where you are — sketch, prototype, or ready to ship. We'll take it from there.
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
