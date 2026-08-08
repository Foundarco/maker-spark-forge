import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Section, SectionHeading, Eyebrow } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { services, projects, processSteps } from "@/config/site-content";
import { ArrowRight, ArrowUpRight, ShieldCheck, FileText, CalendarCheck, Hammer } from "lucide-react";
import heroAsset from "@/assets/mg-hero.jpg.asset.json";
import plansAsset from "@/assets/mg-plans.jpg.asset.json";
import carpentryAsset from "@/assets/mg-carpentry.jpg.asset.json";

function isHqHost(host: string): boolean {
  const h = host.toLowerCase().split(":")[0];
  return h === "hq.clovrlab.com" || h.startsWith("hq.") || h.startsWith("hq--");
}

const title = `${brand.name} — ${brand.tagline}`;

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && isHqHost(window.location.hostname)) {
      throw redirect({ to: "/hq-login" });
    }
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: brand.shortMission },
      { property: "og:title", content: title },
      { property: "og:description", content: brand.shortMission },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clovrlab.com/" },
      { property: "og:image", content: heroAsset.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroAsset.url },
    ],
    links: [{ rel: "canonical", href: "https://clovrlab.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "GeneralContractor",
          name: brand.name,
          description: brand.shortMission,
          telephone: brand.phone,
          email: brand.contact.estimates,
          foundingDate: String(brand.established),
          areaServed: brand.serviceArea,
          url: "https://clovrlab.com/",
        }),
      },
    ],
  }),
  component: HomePage,
});

const stats = [
  { value: `${new Date().getFullYear() - brand.established}+`, label: "Years building" },
  { value: "600+", label: "Projects completed" },
  { value: "72%", label: "Repeat & referral work" },
  { value: "5 yr", label: "Workmanship warranty" },
];

const promises = [
  { icon: FileText, title: "Line-item estimates", body: "Every scope priced out in writing. Allowances stated up front, no vague lump sums." },
  { icon: CalendarCheck, title: "Schedules that hold", body: "A published build calendar with milestones, crew leads, and weekly written updates." },
  { icon: Hammer, title: "Our own crews", body: "Framing, carpentry, and finish work done in-house — not handed to whoever is available." },
  { icon: ShieldCheck, title: "Licensed & insured", body: "Full liability and workers' comp coverage, plus a written five-year workmanship warranty." },
];

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-16 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[1fr_1.05fr] lg:items-end lg:pb-20">
          <div>
            <p className="rule-label flex items-center gap-3 text-muted-foreground">
              <span className="h-px w-8 bg-ink/30" aria-hidden />
              General contractor · Est. {brand.established}
            </p>
            <h1 className="mt-6 text-5xl font-bold leading-[0.98] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Built right.
              <br />
              Built to last.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
              A family-run general contractor building homes, additions, and renovations with disciplined
              craftsmanship and schedules that hold. Three decades of doing it the same careful way.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <CTAButton to="/contact" variant="primary">
                Request an estimate <ArrowRight className="h-4 w-4" />
              </CTAButton>
              <CTAButton to="/projects" variant="secondary">
                View projects
              </CTAButton>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroAsset.url}
              alt="A custom home under construction with exposed timber framing and concrete forms"
              width={1920}
              height={1200}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="border-b border-border bg-warm">
        <dl className="mx-auto grid w-full max-w-7xl grid-cols-2 divide-x divide-border px-5 sm:px-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-8 first:pl-0 lg:px-8">
              <dt className="rule-label text-muted-foreground">{s.label}</dt>
              <dd className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* SERVICES */}
      <Section wide>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="What we build"
            title="Six disciplines, one accountable team."
            lede="From ground-up homes to a single well-made built-in, the same crews and the same standards apply."
          />
          <Link to="/services" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:underline">
            All services <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.slug}
              to="/services"
              hash={s.slug}
              className="group flex flex-col bg-card p-8 transition-colors hover:bg-warm"
            >
              <p className="rule-label text-muted-foreground">{s.typical}</p>
              <h3 className="mt-4 font-display text-xl font-bold text-ink">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                Details <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* PROMISES / SPLIT */}
      <section className="border-y border-border bg-warm">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center">
          <img
            src={plansAsset.url}
            alt="Floor plans, tape measure, pencil and level laid out on a plywood table"
            width={1600}
            height={1200}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
          <div>
            <SectionHeading
              eyebrow="How we work"
              title="No surprises. That's the whole promise."
              lede="Most construction complaints come down to cost creep, missed dates, and silence. We built our process around removing all three."
            />
            <ul className="mt-10 divide-y divide-border border-y border-border">
              {promises.map((p) => (
                <li key={p.title} className="flex gap-5 py-5">
                  <p.icon className="mt-0.5 h-5 w-5 shrink-0 text-ink" aria-hidden />
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <Section wide>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Recent work" title="Projects we're proud to put our name on." />
          <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:underline">
            All projects <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {projects.slice(0, 3).map((p) => (
            <Link key={p.slug} to="/projects" hash={p.slug} className="group block">
              <div className="overflow-hidden bg-muted">
                <img
                  src={p.image}
                  alt={p.title}
                  width={1600}
                  height={1200}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <p className="rule-label mt-5 text-muted-foreground">
                {p.category} · {p.year}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* PROCESS */}
      <section className="border-y border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <SectionHeading
            eyebrow="The process"
            title="Seven steps, every single project."
            lede="The same sequence whether we're building a deck or a house. It's why our schedules are predictable."
          />
          <ol className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.slice(0, 4).map((s) => (
              <li key={s.n} className="bg-card p-8">
                <p className="font-display text-2xl font-bold text-ink/25">{s.n}</p>
                <h3 className="mt-4 font-display text-base font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <CTAButton to="/process" variant="secondary">
              Read the full process <ArrowRight className="h-4 w-4" />
            </CTAButton>
          </div>
        </div>
      </section>

      {/* CTA */}
      <Section wide>
        <div className="grid gap-10 bg-ink px-8 py-16 text-white sm:px-14 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="rule-label text-white/50">Start a project</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Tell us what you want to build.
            </h2>
            <p className="mt-5 max-w-xl text-white/70">
              Send us the details and photos. We'll follow up within two business days to schedule a site visit
              and put a real number in front of you.
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <CTAButton to="/contact" variant="light" className="w-full lg:w-auto">
              Request an estimate <ArrowRight className="h-4 w-4" />
            </CTAButton>
            <a
              href={`tel:${brand.phone.replace(/[^0-9+]/g, "")}`}
              className="text-center text-sm text-white/70 hover:text-white lg:text-right"
            >
              Or call {brand.phone}
            </a>
          </div>
        </div>
      </Section>

      {/* CRAFT STRIP */}
      <div className="border-t border-border">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.2fr]">
          <img
            src={carpentryAsset.url}
            alt="Close detail of hand-cut joinery on custom white oak casework"
            width={1600}
            height={1200}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
          <div>
            <Eyebrow>Standards</Eyebrow>
            <p className="max-w-xl font-display text-2xl font-bold leading-snug text-ink sm:text-3xl">
              &ldquo;If a joint doesn't close, we cut it again. That's not a policy — it's just how the family
              has always worked.&rdquo;
            </p>
            <p className="mt-5 text-sm text-muted-foreground">Dan McGuire, founder</p>
          </div>
        </div>
      </div>
    </>
  );
}
