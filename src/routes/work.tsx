import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { CloudBackdrop } from "@/components/site/CloudBackdrop";
import { CTAButton } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { ArrowRight } from "lucide-react";
import sketchAsset from "@/assets/cloud-sketch.jpg.asset.json";
import detailAsset from "@/assets/cloud-detail.jpg.asset.json";
import workshopAsset from "@/assets/cloud-workshop.jpg.asset.json";
import productAsset from "@/assets/cloud-product.jpg.asset.json";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: `Work — ${brand.name}` },
      { name: "description", content: "Selected hardware products we've designed, engineered, and shipped." },
      { property: "og:title", content: `Work — ${brand.name}` },
      { property: "og:description", content: "Selected hardware products we've designed, engineered, and shipped." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: WorkPage,
});

const projects = [
  { img: productAsset.url, tag: "Consumer electronics", title: "[Placeholder] Ambient home hub", body: "Ambient sensor + speaker device. Concept → 5k units in 8 months.", metric: "8 months to market" },
  { img: sketchAsset.url, tag: "Wearable", title: "[Placeholder] Health wearable", body: "FDA Class II wearable with continuous biometrics. FCC + CE in 12 weeks.", metric: "12wk to certification" },
  { img: detailAsset.url, tag: "Industrial IoT", title: "[Placeholder] LoRa gateway", body: "Outdoor-rated IoT gateway. Custom PCB, injection molded enclosure.", metric: "IP67 rated" },
  { img: workshopAsset.url, tag: "Robotics", title: "[Placeholder] Warehouse assistant", body: "Autonomous cart. Full mechanical, electrical, and firmware development.", metric: "50+ units deployed" },
];

function WorkPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <CloudBackdrop variant="soft" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-8 pt-20 sm:px-8 sm:pt-28">
          <PageHeader
            eyebrow="Selected work"
            title={<>Products we've helped <span className="text-primary">put on the shelf.</span></>}
            lede="A few of the projects we're proud of. Names redacted for NDA-covered work — full case studies available on request."
          />
        </div>
      </section>

      <Section wide>
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <article key={p.title} className="group overflow-hidden rounded-3xl border border-sky-200/60 bg-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/10">
              <div className="aspect-[4/3] overflow-hidden bg-sky-50">
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">{p.tag}</p>
                  <p className="text-xs font-medium text-muted-foreground">{p.metric}</p>
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 text-muted-foreground">{p.body}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section wide>
        <div className="rounded-[2rem] border border-sky-200/60 bg-sky-50/60 px-8 py-14 sm:px-14">
          <Eyebrow>Want the full case studies?</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Most of our work is under NDA. Reach out — we'll walk you through what we can share.
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <CTAButton to="/quote" variant="primary">
              Start a project <ArrowRight className="h-4 w-4" />
            </CTAButton>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-6 py-3 text-sm font-semibold text-ink hover:border-primary/40"
            >
              Contact us
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
