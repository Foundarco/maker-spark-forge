import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Section, SectionHeading, SectionLabel, DisplayHeading } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { services, projects } from "@/config/site-content";
import { divisions, statusTone } from "@/config/divisions";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import heroAsset from "@/assets/mg2-hero.jpg.asset.json";
import legacyAsset from "@/assets/mg2-legacy.jpg.asset.json";
import carpentryAsset from "@/assets/mg-carpentry.jpg.asset.json";

function isHqHost(host: string): boolean {
  const h = host.toLowerCase().split(":")[0];
  return h === "hq.clovrlab.com" || h.startsWith("hq.") || h.startsWith("hq--");
}

const title = `${brand.name} — Built since ${brand.established}. Built for what's next.`;
const description =
  "McGuire Construction is a family-run builder established in 1995, growing into a vertically integrated construction group: construction, concrete, excavation, landscape, and development.";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && isHqHost(window.location.hostname)) {
      throw redirect({ to: "/hq-login" });
    }
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
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
          description,
          telephone: brand.phone,
          email: brand.contact.estimates,
          foundingDate: String(brand.established),
          areaServed: brand.serviceArea,
          url: "https://clovrlab.com/",
          department: divisions.map((d) => ({ "@type": "Organization", name: d.name })),
        }),
      },
    ],
  }),
  component: HomePage,
});

const timeline = [
  { year: "1995", title: "The first crew", body: "The family picks up its first contracts — framing, additions, and finish carpentry done by hand, one job at a time." },
  { year: "2000s", title: "Systems take hold", body: "Checklists, written estimates, and published schedules replace handshake deals. Quality stops depending on who shows up." },
  { year: "2010s", title: "Full-scope building", body: "Ground-up homes, structural work, and whole-home renovations delivered under one accountable team." },
  { year: "Today", title: "A second generation", body: "The next generation takes the same standards and starts building the organization around them." },
  { year: "Next", title: "Vertical integration", body: "Concrete, excavation, landscape, and development brought in-house — the whole build self-performed." },
];

const phases = [
  { n: "01", title: "Plan", body: "Site assessment, scope definition, line-item estimate, and a schedule before a single tool comes out." },
  { n: "02", title: "Prepare", body: "Permits, engineering, material lead times, and crew assignments locked in ahead of mobilization." },
  { n: "03", title: "Build", body: "Daily cleanup, weekly written updates, documented change orders, and inspections at every stage." },
  { n: "04", title: "Deliver", body: "Punch list, closeout documentation, finish specs, and a written workmanship warranty." },
];

const whyMcGuire = [
  { k: "Systems, not personalities", v: "Three decades of checklists and inspections mean the standard holds on every job, on every crew." },
  { k: "Written before it's built", v: "Line-item estimates, published schedules, documented change orders. Nothing verbal, nothing vague." },
  { k: "Built to be integrated", v: "Every division we add removes a subcontractor handoff — and the delay that comes with it." },
  { k: "Generational thinking", v: "A family company building for the next thirty years, not the next invoice." },
];

function HomePage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative isolate bg-ink text-white">
        <img
          src={heroAsset.url}
          alt="Wood-framed home under construction at golden hour with scaffolding and open roof trusses"
          width={1920}
          height={1088}
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/50 to-ink/70" aria-hidden />
        <div className="mx-auto flex w-full max-w-7xl flex-col justify-end px-5 pb-16 pt-32 sm:px-8 sm:pb-24 sm:pt-48">
          <SectionLabel tone="light">General contractor · Established {brand.established}</SectionLabel>
          <h1 className="display-cond mt-8 max-w-5xl text-[clamp(2.75rem,9vw,7.5rem)] text-white">
            Built since {brand.established}.
            <br />
            Built for what&rsquo;s next.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/75">
            A family construction company carried into its second generation — and built to become a fully
            integrated construction organization.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <CTAButton to="/contact" variant="light">
              Start a project <ArrowRight className="h-4 w-4" />
            </CTAButton>
            <Link
              to="/divisions"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 border border-white/35 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-ink"
            >
              The McGuire Group
            </Link>
          </div>
        </div>
        {/* division ticker */}
        <div className="border-t border-white/12">
          <ul className="mx-auto grid w-full max-w-7xl grid-cols-2 divide-x divide-white/10 px-5 text-white/60 sm:px-8 lg:grid-cols-5">
            {divisions.map((d) => (
              <li key={d.slug} className="px-4 py-5 first:pl-0">
                <p className="rule-label text-white/35">{d.n}</p>
                <p className="mt-1.5 text-sm font-semibold text-white">{d.short}</p>
                <p className="text-xs text-white/45">{d.status}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── LEGACY ───────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-start">
          <div className="relative lg:sticky lg:top-28">
            <img
              src={legacyAsset.url}
              alt="Worn vintage framing square, folding rule, chisels and a leather tool belt on a weathered workbench"
              width={1600}
              height={1200}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute -bottom-6 -right-2 hidden bg-ink px-6 py-5 text-white sm:block lg:-right-6">
              <p className="rule-label text-white/45">Established</p>
              <p className="display-cond text-4xl">{brand.established}</p>
            </div>
          </div>
          <div>
            <SectionLabel n="01">The legacy</SectionLabel>
            <DisplayHeading className="mt-6 text-ink">
              A family legacy.
              <br />A new generation.
            </DisplayHeading>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
              McGuire started in 1995 with a small crew, hand tools, and a rule that hasn&rsquo;t changed since: if
              it isn&rsquo;t right, it gets redone. Three decades later the same standard runs the company — now
              carried by the next generation, with the systems and ambition to grow well beyond a single crew.
            </p>
            <ol className="mt-10 divide-y divide-border border-y border-border">
              {timeline.map((t) => (
                <li key={t.year} className="grid gap-2 py-5 sm:grid-cols-[7rem_1fr] sm:gap-6">
                  <span className="display-cond text-xl text-ink/45">{t.year}</span>
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">{t.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-9">
              <CTAButton to="/about" variant="secondary">
                Read our story
              </CTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE McGUIRE GROUP ────────────────────────────── */}
      <section className="border-b border-border bg-warm">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <SectionLabel n="02">The McGuire Group</SectionLabel>
              <DisplayHeading className="mt-6 text-ink">Divisions</DisplayHeading>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                One organization, built in stages. Construction today — with each division that follows bringing
                another part of the build under our own roof.
              </p>
            </div>
            <Link to="/divisions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:underline">
              All divisions <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ul className="mt-14 border-t border-border">
            {divisions.map((d) => (
              <li key={d.slug} className="border-b border-border">
                <Link
                  to="/divisions/$slug"
                  params={{ slug: d.slug }}
                  className="group relative grid items-center gap-6 overflow-hidden py-8 lg:grid-cols-[5rem_18rem_1fr_10rem] lg:gap-8"
                >
                  <span className="display-cond text-3xl text-ink/20 transition-colors group-hover:text-ink/60">
                    {d.n}
                  </span>
                  <h3 className="display-cond text-[clamp(1.5rem,3vw,2.25rem)] text-ink">{d.name}</h3>
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{d.tagline}</p>
                  <div className="flex items-center justify-between gap-4 lg:justify-end">
                    <span className={`rule-label border px-2.5 py-1 ${statusTone[d.status]}`}>{d.status}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────── */}
      <Section wide>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <SectionLabel n="03">What we build today</SectionLabel>
            <DisplayHeading className="mt-6 text-ink">Construction</DisplayHeading>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Six disciplines, one accountable team. From ground-up homes to a single well-made built-in, the same
              crews and the same standards apply.
            </p>
          </div>
          <Link to="/services" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:underline">
            All services <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Link
              key={s.slug}
              to="/services"
              hash={s.slug}
              className="group flex flex-col bg-card p-8 transition-colors hover:bg-warm"
            >
              <p className="display-cond text-2xl text-ink/20">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 font-display text-xl font-bold text-ink">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                {s.typical}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── BUILT ON SYSTEMS ─────────────────────────────── */}
      <section className="relative border-y border-border bg-ink text-white">
        <div className="pointer-events-none absolute inset-0 blueprint-grid text-white opacity-70" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <SectionLabel n="04" tone="light">Built on systems</SectionLabel>
          <DisplayHeading className="mt-6 max-w-3xl text-white">
            The same sequence, every project.
          </DisplayHeading>
          <p className="mt-6 max-w-xl text-white/70">
            Construction goes wrong in the gaps between people. Our process closes them — the same four phases
            whether we&rsquo;re building a deck or a house.
          </p>

          <ol className="mt-16 grid gap-px bg-white/12 lg:grid-cols-4">
            {phases.map((p, i) => (
              <li key={p.n} className="relative bg-ink p-8">
                <div className="flex items-center gap-4">
                  <span className="display-cond text-3xl text-white/30">{p.n}</span>
                  <span className="h-px flex-1 bg-white/15" aria-hidden />
                  {i < phases.length - 1 ? (
                    <ArrowRight className="hidden h-4 w-4 text-white/30 lg:block" aria-hidden />
                  ) : null}
                </div>
                <h3 className="display-cond mt-6 text-2xl text-white">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{p.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12">
            <CTAButton to="/process" variant="light">
              See the full process <ArrowRight className="h-4 w-4" />
            </CTAButton>
          </div>
        </div>
      </section>

      {/* ── WHY McGUIRE ──────────────────────────────────── */}
      <Section wide>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.25fr]">
          <div>
            <SectionLabel n="05">Why McGuire</SectionLabel>
            <DisplayHeading className="mt-6 text-ink">
              Discipline
              <br />
              over promises.
            </DisplayHeading>
            <img
              src={carpentryAsset.url}
              alt="Close detail of hand-cut joinery on custom white oak casework"
              width={1600}
              height={1200}
              loading="lazy"
              className="mt-10 aspect-[4/3] w-full object-cover"
            />
          </div>
          <dl className="divide-y divide-border border-y border-border">
            {whyMcGuire.map((w) => (
              <div key={w.k} className="grid gap-2 py-7 sm:grid-cols-[1fr_1.4fr] sm:gap-8">
                <dt className="display-cond text-xl text-ink">{w.k}</dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">{w.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* ── PROJECTS ─────────────────────────────────────── */}
      <section className="border-y border-border bg-warm">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Recent work" title="Projects we put our name on." />
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
        </div>
      </section>

      {/* ── AMBITION / CTA ───────────────────────────────── */}
      <section className="relative bg-ink text-white">
        <div className="pointer-events-none absolute inset-0 blueprint-grid text-white opacity-60" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <SectionLabel n="06" tone="light">The next thirty years</SectionLabel>
          <h2 className="display-cond mt-8 max-w-5xl text-[clamp(2.5rem,8vw,6.5rem)] text-white">
            This is only
            <br />
            the beginning.
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70">
            McGuire is being built the way a building is built — foundation first. Construction today. Concrete,
            excavation, landscape, and development to come. One organization, self-performing the whole job.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <CTAButton to="/contact" variant="light">
              Start a project <ArrowRight className="h-4 w-4" />
            </CTAButton>
            <a
              href={`tel:${brand.phone.replace(/[^0-9+]/g, "")}`}
              className="text-sm text-white/60 transition hover:text-white"
            >
              Or call {brand.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
