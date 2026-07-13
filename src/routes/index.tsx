import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Section, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { CTAButton } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { productsQuery, postsQuery } from "@/lib/content.queries";
import { ArrowRight, Wrench, GraduationCap, Users, Eye, Check, Zap, ShieldCheck } from "lucide-react";
import heroPrinter from "@/assets/hero-printer.jpg.asset.json";
import materials from "@/assets/materials.jpg.asset.json";
import community from "@/assets/community.jpg.asset.json";
import detail from "@/assets/detail.jpg.asset.json";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery);
    context.queryClient.ensureQueryData(postsQuery);
  },
  head: () => ({
    meta: [
      { title: `${brand.name} — ${brand.tagline}` },
      { name: "description", content: brand.shortMission },
      { property: "og:title", content: `${brand.name} — ${brand.tagline}` },
      { property: "og:description", content: brand.shortMission },
      { property: "og:image", content: heroPrinter.url },
      { name: "twitter:image", content: heroPrinter.url },
    ],
  }),
  component: HomePage,
});

const valueProps = [
  { icon: Users, title: "Community-first", body: "Owners help owners. Guides, models, and fixes live in the open." },
  { icon: GraduationCap, title: "Built to teach", body: "Every printer is a working lesson — visible mechanism, real curriculum." },
  { icon: Wrench, title: "Repairable", body: "Standard fasteners. Printable spares. Step-by-step fixes for every failure." },
  { icon: Eye, title: "Honest engineering", body: "We tell you what the machine is good at — and what it isn't." },
];

const stats = [
  { value: "0.05mm", label: "Layer precision" },
  { value: "500mm/s", label: "Print speed" },
  { value: "1 year", label: "Full warranty" },
  { value: "100%", label: "Repairable" },
];

function HomePage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: posts } = useSuspenseQuery(postsQuery);
  const printer = products.find((p) => p.category === "printer") ?? products[0];
  const pellets = products.find((p) => p.category === "material");

  return (
    <>
      {/* HERO — full-bleed dark */}
      <section className="relative overflow-hidden surface-dark">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 70% 30%, oklch(0.35 0.15 40 / 0.5), transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, oklch(0.3 0.1 260 / 0.3), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 pb-20 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pb-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Now shipping · The Core Printer
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              3D printing,<br />
              <span className="text-primary">demystified.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
              A precision desktop printer built to be understood, repaired, and taught with. No sealed cases. No lock-in. Just a machine that works — and shows you how.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <CTAButton to="/store" variant="primary">
                Shop the printer <ArrowRight className="h-4 w-4" />
              </CTAButton>
              <CTAButton to="/how-its-built" variant="light">
                See how it's built
              </CTAButton>
            </div>
            <dl className="mt-14 grid max-w-lg grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-bold text-white sm:text-3xl">{s.value}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wider text-white/50">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-primary/20 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40">
              <img
                src={heroPrinter.url}
                alt="The Core Printer — open-frame desktop 3D printer"
                width={1600}
                height={1408}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur">
                Model shown: Core Printer · [PLACEHOLDER]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE / TRUST STRIP */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-10 gap-y-4 px-5 py-6 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by educators & makers
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-semibold text-muted-foreground/70">
            <span>[PLACEHOLDER SCHOOL]</span>
            <span>[PLACEHOLDER MAKERSPACE]</span>
            <span>[PLACEHOLDER UNIVERSITY]</span>
            <span>[PLACEHOLDER LIBRARY]</span>
            <span>[PLACEHOLDER STUDIO]</span>
          </div>
        </div>
      </div>

      {/* VALUE PROPS */}
      <Section wide>
        <div className="mb-14 max-w-2xl">
          <Eyebrow>What we believe</Eyebrow>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Hardware you can actually own.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((v) => (
            <Card key={v.title}>
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <v.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-ink">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* FEATURE SPLIT — DETAIL */}
      <section className="bg-surface">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div className="relative order-2 overflow-hidden rounded-3xl lg:order-1">
            <img
              src={detail.url}
              alt="Precision extruder with orange filament"
              width={1400}
              height={1200}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <Eyebrow>Engineered to be seen</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              Every mechanism, out in the open.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              We didn't hide the motion system behind plastic shrouds. If a belt tightens, you can watch it. If a bearing wears, you can replace it. Learning happens because you can see what the machine is doing.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Linear rails on all three axes",
                "Direct-drive extruder with quick-swap hotend",
                "Labeled harnesses, standard connectors",
                "Every screw is M3 or M5. No proprietary tools.",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <CTAButton to="/how-its-built" variant="secondary">
                Full spec tear-down <ArrowRight className="h-4 w-4" />
              </CTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <Section wide>
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <Eyebrow>The lineup</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              A printer, materials, and everything to keep printing.
            </h2>
          </div>
          <Link to="/store" className="hidden text-sm font-semibold text-primary hover:underline sm:inline-flex">
            Visit the store →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {printer && (
            <Link
              to="/store/$slug"
              params={{ slug: printer.slug }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10"
            >
              <div className="aspect-[4/3] overflow-hidden surface-dark">
                <img
                  src={heroPrinter.url}
                  alt={printer.name}
                  width={1600}
                  height={1408}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">{printer.category}</p>
                <h3 className="mt-2 text-2xl font-semibold">{printer.name}</h3>
                <p className="mt-2 text-muted-foreground">{printer.tagline}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-lg font-semibold">{printer.price_display}</span>
                  <span className="text-sm font-semibold text-primary">Learn more →</span>
                </div>
              </div>
            </Link>
          )}
          {pellets && (
            <Link
              to="/store/$slug"
              params={{ slug: pellets.slug }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10"
            >
              <div className="aspect-[4/3] overflow-hidden bg-warm">
                <img
                  src={materials.url}
                  alt={pellets.name}
                  width={1400}
                  height={1000}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">{pellets.category}</p>
                <h3 className="mt-2 text-2xl font-semibold">{pellets.name}</h3>
                <p className="mt-2 text-muted-foreground">{pellets.tagline}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-lg font-semibold">{pellets.price_display}</span>
                  <span className="text-sm font-semibold text-primary">Learn more →</span>
                </div>
              </div>
            </Link>
          )}
        </div>
      </Section>

      {/* COMMUNITY / EDUCATION */}
      <section className="bg-surface">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div className="relative overflow-hidden rounded-3xl">
            <img
              src={community.url}
              alt="Students learning with a 3D printer"
              width={1400}
              height={1000}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <Eyebrow>Built for classrooms</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              A tool that grows with the student.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Curriculum-ready lesson plans, printable projects, and Missions built into our Learning Center. From first print to first CAD design — one machine takes them there.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6">
              <div className="rounded-2xl border border-border bg-card p-5">
                <Zap className="mb-3 h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">50+</p>
                <p className="text-sm text-muted-foreground">Free lesson plans</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">Safe by design</p>
                <p className="text-sm text-muted-foreground">Educator-vetted defaults</p>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <CTAButton to="/learn">Explore Learning Center</CTAButton>
              <CTAButton to="/get-involved" variant="secondary">For educators</CTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Section wide>
        <div className="mb-12 max-w-2xl">
          <Eyebrow>The community</Eyebrow>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Real people, printing real things.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { name: "[PLACEHOLDER ambassador]", role: "Ambassador · [City]", quote: "It's the first printer I've been able to hand to a nine-year-old and walk away from." },
            { name: "[PLACEHOLDER educator]", role: "STEM teacher", quote: "Repair guides that don't need me to open a service ticket. Our lab has never been more up." },
            { name: "[PLACEHOLDER maker]", role: "Home user", quote: "I broke a part in month two. Printed a replacement from the STL that same night." },
          ].map((c) => (
            <Card key={c.name}>
              <div className="mb-4 flex gap-0.5 text-primary" aria-hidden>
                {"★★★★★".split("").map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
              <p className="text-base leading-relaxed text-foreground">"{c.quote}"</p>
              <div className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* MISSION CTA */}
      <Section wide>
        <div className="relative overflow-hidden rounded-[2rem] surface-dark px-8 py-16 sm:px-16 sm:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 100% 50%, oklch(0.4 0.18 40 / 0.5), transparent 60%)",
            }}
            aria-hidden
          />
          <div className="relative grid gap-10 md:grid-cols-[1.5fr_1fr] md:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-white/80">
                Our mission
              </span>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
                Make 3D printing approachable.<br />
                <span className="text-primary">Expand youth STEM.</span>
              </h2>
            </div>
            <div className="flex md:justify-end">
              <CTAButton to="/mission" variant="light">
                Read the full story <ArrowRight className="h-4 w-4" />
              </CTAButton>
            </div>
          </div>
        </div>
      </Section>

      {/* LATEST POSTS */}
      {posts.length > 0 && (
        <Section wide>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <Eyebrow>Journal</Eyebrow>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">From the blog</h2>
            </div>
            <Link to="/blog" className="text-sm font-semibold text-primary hover:underline">All posts →</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {posts.slice(0, 3).map((p) => (
              <Card key={p.slug} as="article">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">{p.category}</p>
                <h3 className="mt-3 text-lg font-semibold leading-snug">
                  <Link to="/blog/$slug" params={{ slug: p.slug }} className="hover:underline">{p.title}</Link>
                </h3>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                >
                  Read <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
