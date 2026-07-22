import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Section, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { CTAButton } from "@/components/site/CTAButton";
import { CloudBackdrop } from "@/components/site/CloudBackdrop";
import { brand } from "@/config/brand";
import {
  ArrowRight,
  ArrowUpRight,
  Cloud,
  Cpu,
  Factory,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
} from "lucide-react";
import heroAsset from "@/assets/cloud-hero.jpg.asset.json";
import fieldAsset from "@/assets/cloud-field.jpg.asset.json";
import workshopAsset from "@/assets/cloud-workshop.jpg.asset.json";
import sketchAsset from "@/assets/cloud-sketch.jpg.asset.json";
import detailAsset from "@/assets/cloud-detail.jpg.asset.json";

function isHqHost(host: string): boolean {
  const h = host.toLowerCase().split(":")[0];
  return h === "hq.clovrlab.com" || h.startsWith("hq.") || h.startsWith("hq--");
}

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && isHqHost(window.location.hostname)) {
      throw redirect({ to: "/hq-login" });
    }
  },
  head: () => ({
    meta: [
      { title: `${brand.name} — ${brand.tagline}` },
      { name: "description", content: brand.shortMission },
      { property: "og:title", content: `${brand.name} — ${brand.tagline}` },
      { property: "og:description", content: brand.shortMission },
      { property: "og:type", content: "website" },
      { property: "og:image", content: heroAsset.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroAsset.url },
    ],
  }),
  component: HomePage,
});

const services = [
  {
    icon: Sparkles,
    title: "Product Development",
    body: "Industrial design, mechanical engineering, and electronics — from napkin sketch to production-ready CAD.",
  },
  {
    icon: Layers,
    title: "Prototyping",
    body: "In-house 3D printing, CNC machining, and PCB assembly. See your idea in your hands within a week.",
  },
  {
    icon: Factory,
    title: "Manufacturing",
    body: "Tooling, assembly lines, QA, and fulfillment. Batches of 50 or runs of 50,000 — we own the whole chain.",
  },
  {
    icon: Cpu,
    title: "Electronics & Firmware",
    body: "PCB design, embedded software, connectivity, and certification. Silicon to shelf, in one team.",
  },
];

const stats = [
  { value: "5 days", label: "Idea → prototype" },
  { value: "1 team", label: "Design + factory" },
  { value: "50k+", label: "Units shipped" },
  { value: "100%", label: "In-cloud tracked" },
];

const processSteps = [
  { n: "01", title: "Discovery", body: "We map the product, the customer, and the constraints. You leave with a scope and a number." },
  { n: "02", title: "Design", body: "Industrial design and engineering happen in the same room. Every week, you see progress." },
  { n: "03", title: "Prototype", body: "Working units in 5–15 days. We iterate on real hardware, not renders." },
  { n: "04", title: "Manufacture", body: "Tooling, first article, ramp. Our factory floor becomes yours — with full transparency." },
  { n: "05", title: "Ship", body: "QA, packaging, and fulfillment. You watch every unit leave, in real time, from the cloud." },
];

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <CloudBackdrop variant="dawn" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pb-32">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-primary backdrop-blur-sm">
              <Cloud className="h-3.5 w-3.5" aria-hidden />
              A hardware product studio
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              From idea to shelf.
              <br />
              <span className="text-primary">One team, one cloud.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              We're a hardware product studio. Design, prototyping, and manufacturing under one roof — so your product ships faster, costs less, and actually works.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <CTAButton to="/quote" variant="primary">
                Start a project <ArrowRight className="h-4 w-4" />
              </CTAButton>
              <CTAButton to="/process" variant="secondary">
                See how we work
              </CTAButton>
            </div>
            <dl className="mt-14 grid max-w-lg grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-bold text-ink sm:text-3xl">{s.value}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-sky-200/60 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-sky-500/10">
              <img
                src={heroAsset.url}
                alt="A sky of soft cumulus clouds"
                width={1920}
                height={1200}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/40 bg-white/80 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
                Currently shipping 3 client products
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="border-y border-sky-200/60 bg-sky-50/60">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-10 gap-y-4 px-5 py-6 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by founders, brands & operators
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-semibold text-muted-foreground/70">
            <span>[PLACEHOLDER BRAND]</span>
            <span>[PLACEHOLDER STARTUP]</span>
            <span>[PLACEHOLDER STUDIO]</span>
            <span>[PLACEHOLDER LAB]</span>
            <span>[PLACEHOLDER OEM]</span>
          </div>
        </div>
      </div>

      {/* SERVICES */}
      <Section wide>
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Eyebrow>What we do</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              A full hardware team, on demand.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Skip the agencies, the factories, and the middlemen. One team owns the entire arc — from the first sketch to the last shipment.
            </p>
          </div>
          <Link to="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            All services <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <Card key={s.title}>
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-primary">
                <s.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* PROCESS TIMELINE */}
      <section className="relative overflow-hidden bg-sky-50/50">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${fieldAsset.url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.35,
          }}
        />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
          <div className="mb-14 max-w-2xl">
            <Eyebrow>The process</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Five steps. No handoffs.
            </h2>
          </div>
          <ol className="grid gap-4 md:grid-cols-5">
            {processSteps.map((s) => (
              <li key={s.n} className="relative rounded-2xl border border-white/60 bg-white/85 p-6 backdrop-blur-sm">
                <p className="font-display text-sm font-semibold text-primary">{s.n}</p>
                <h3 className="mt-3 text-base font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <CTAButton to="/process" variant="primary">
              Read the full process <ArrowRight className="h-4 w-4" />
            </CTAButton>
          </div>
        </div>
      </section>

      {/* FEATURE SPLIT — CLOUD-NATIVE OPS */}
      <Section wide>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div className="relative overflow-hidden rounded-3xl border border-sky-200/60">
            <img
              src={workshopAsset.url}
              alt="Studio workshop with cloudscape visible through the windows"
              width={1600}
              height={1000}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <Eyebrow>Cloud-native by default</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              Every file, every unit, every dollar — visible from anywhere.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Every drawing, BOM, inspection, and shipment lives in one dashboard you can open from anywhere. No email chains. No lost revisions. No surprises.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Live BOM with real per-unit cost",
                "Every CAD revision, versioned and shareable",
                "QA inspection photos on every unit",
                "Real-time production, inventory, and shipping",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <ShieldCheck className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <CTAButton to="/work" variant="secondary">
                See our work <ArrowRight className="h-4 w-4" />
              </CTAButton>
            </div>
          </div>
        </div>
      </Section>

      {/* WORK PREVIEW */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <Eyebrow>Selected work</Eyebrow>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                Products we've helped ship.
              </h2>
            </div>
            <Link to="/work" className="hidden text-sm font-semibold text-primary hover:underline sm:inline-flex">
              All projects →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              { img: sketchAsset.url, tag: "Consumer electronics", title: "[Placeholder] Home audio device", body: "From industrial concept to 10k units shipped in 9 months." },
              { img: detailAsset.url, tag: "Health tech", title: "[Placeholder] Wearable sensor", body: "FCC-certified prototype in 12 weeks. Manufacturing ramp in 6." },
            ].map((c) => (
              <article key={c.title} className="group overflow-hidden rounded-3xl border border-sky-200/60 bg-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/10">
                <div className="aspect-[4/3] overflow-hidden bg-sky-50">
                  <img
                    src={c.img}
                    alt={c.title}
                    width={1600}
                    height={1200}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">{c.tag}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-ink">{c.title}</h3>
                  <p className="mt-2 text-muted-foreground">{c.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <Section wide>
        <div className="mb-12 max-w-2xl">
          <Eyebrow>Why {brand.name}</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Built differently, on purpose.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Users, title: "One team, no handoffs", body: "Designers, engineers, and factory ops share one Slack, one system, one goal." },
            { icon: Zap, title: "Speed as a feature", body: "Prototypes in a week, first article in a month. Nothing waiting on a vendor." },
            { icon: Cloud, title: "Radical transparency", body: "You see the BOM, the timeline, the unit cost, and the failures. All of it. Always." },
          ].map((v) => (
            <Card key={v.title}>
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-primary">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-ink">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section wide>
        <div
          className="relative overflow-hidden rounded-[2rem] px-8 py-16 text-white sm:px-16 sm:py-24"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #2563eb 100%)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url(${fieldAsset.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              mixBlendMode: "screen",
            }}
            aria-hidden
          />
          <div className="relative grid gap-10 md:grid-cols-[1.5fr_1fr] md:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-white/80">
                Let's build something
              </span>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                Have an idea?
                <br />
                <span className="text-sky-300">Let's put it on the shelf.</span>
              </h2>
            </div>
            <div className="flex md:justify-end">
              <CTAButton to="/quote" variant="light">
                Request a quote <ArrowRight className="h-4 w-4" />
              </CTAButton>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
