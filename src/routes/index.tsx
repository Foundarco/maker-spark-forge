import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Section, SectionHeading, SectionLabel, DisplayHeading } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { Reveal } from "@/components/site/Reveal";
import { CountUp } from "@/components/site/CountUp";
import { brand } from "@/config/brand";
import { services, projects } from "@/config/site-content";
import { divisions } from "@/config/divisions";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import heroAsset from "@/assets/mg2-hero.jpg.asset.json";
import legacyAsset from "@/assets/mg2-legacy.jpg.asset.json";
import carpentryAsset from "@/assets/mg-carpentry.jpg.asset.json";

function isHqHost(host: string): boolean {
  const h = host.toLowerCase().split(":")[0];
  return h === "hq.clovrlab.com" || h.startsWith("hq.") || h.startsWith("hq--");
}

const title = `${brand.name} — Five Divisions, One Builder`;
const description =
  `Family-run, vertically integrated builder since ${brand.established}. Construction, concrete, excavation, landscape, and development — all self-performed.`;

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
      { property: "og:image", content: `https://clovrlab.com${heroAsset.url}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `https://clovrlab.com${heroAsset.url}` },
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
  { year: "1974", title: "The first crew", body: "The family picks up its first contracts — framing, additions, and finish carpentry done by hand, one job at a time." },
  { year: "1980s", title: "Systems take hold", body: "Checklists, written estimates, and published schedules replace handshake deals. Quality stops depending on who shows up." },
  { year: "2000s", title: "Full-scope building", body: "Ground-up homes, structural work, and whole-home renovations delivered under one accountable team." },
  { year: "2010s", title: "A second generation", body: "The next generation takes the same standards and builds the organization around them — division by division." },
  { year: "Today", title: "Fully integrated", body: "Construction, concrete, excavation, landscape, and development all open, all in-house, all self-performed." },
];

const phases = [
  { n: "01", title: "Plan", body: "Site assessment, scope definition, line-item estimate, and a schedule before a single tool comes out." },
  { n: "02", title: "Prepare", body: "Permits, engineering, material lead times, and crew assignments locked in ahead of mobilization." },
  { n: "03", title: "Build", body: "Daily cleanup, weekly written updates, documented change orders, and inspections at every stage." },
  { n: "04", title: "Deliver", body: "Punch list, closeout documentation, finish specs, and a written workmanship warranty." },
];

const whyMcGuire = [
  { k: "Systems, not personalities", v: "Five decades of checklists and inspections mean the standard holds on every job, on every crew." },
  { k: "Written before it's built", v: "Line-item estimates, published schedules, documented change orders. Nothing verbal, nothing vague." },
  { k: "One company, zero handoffs", v: "Dirt, concrete, framing, finish, and landscape are all ours. No subcontractor gaps to fall through." },
  { k: "Generational thinking", v: "A family company building for the next fifty years, not the next invoice." },
];

const headlineStats = [
  { label: "Years building", value: "50" },
  { label: "Projects delivered", value: "420+" },
  { label: "Divisions open", value: "5" },
  { label: "Work self-performed", value: "100%" },
];

function HomePage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <img
          src={heroAsset.url}
          alt="Wood-framed home under construction at golden hour with scaffolding and open roof trusses"
          width={1920}
          height={1088}
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/70" aria-hidden />

        <div className="mx-auto flex w-full max-w-7xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-40">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[var(--acc-landscape)]" aria-hidden />
              All five divisions open · Est. {brand.established}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="display-cond mt-8 max-w-5xl text-[clamp(2.75rem,9vw,7.5rem)] text-white">
              Five divisions.
              <br />
              <span className="gradient-text">One builder.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/80">
              A family construction company in its second generation — now self-performing the entire build.
              Dirt to driveway, footing to finish, all under one roof.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="group inline-flex min-h-[52px] items-center gap-2 rounded-full bg-white px-8 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-all hover:shadow-[0_20px_50px_-20px_rgba(255,255,255,0.65)]"
              >
                Start a project
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/divisions"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/35 px-8 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/12"
              >
                Meet the divisions
              </Link>
            </div>
          </Reveal>

          {/* headline stats */}
          <Reveal delay={320}>
            <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/12 sm:grid-cols-4">
              {headlineStats.map((s) => (
                <div key={s.label} className="bg-ink/70 px-5 py-6 backdrop-blur">
                  <dd className="display-cond text-3xl text-white">
                    <CountUp value={s.value} />
                  </dd>
                  <dt className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-white/55">{s.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* colour-coded division marquee */}
        <div className="overflow-hidden border-t border-white/12 py-4">
          <div className="marquee-track gap-10 whitespace-nowrap">
            {[0, 1].map((dup) => (
              <span key={dup} className="flex items-center gap-10 pr-10" aria-hidden={dup === 1}>
                {divisions.map((d) => (
                  <span key={d.slug} className="flex items-center gap-3 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.accent }} />
                    <span className="display-cond text-xl text-white">{d.short}</span>
                    <span className="rule-label text-white/40">Open</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE McGUIRE GROUP ────────────────────────────── */}
      <section className="border-b border-border bg-warm">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal className="max-w-2xl">
              <SectionLabel n="01">The McGuire Group</SectionLabel>
              <DisplayHeading className="mt-6 text-ink">
                Every division, <span className="gradient-text">open</span>.
              </DisplayHeading>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                We stopped subcontracting the parts of a build we cared about most. Today all five divisions are
                staffed, equipped, and taking work — running on the same schedule and the same standards.
              </p>
            </Reveal>
            <Link to="/divisions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:underline">
              All divisions <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {divisions.map((d, i) => (
              <Reveal
                as="li"
                key={d.slug}
                delay={i * 70}
                className={i === 0 ? "lg:col-span-2" : ""}
              >
                <Link
                  to="/divisions/$slug"
                  params={{ slug: d.slug }}
                  style={{ ["--accent-color" as string]: d.accent }}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card lift-card accent-ring"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={d.image}
                      alt={d.imageAlt}
                      width={1600}
                      height={1200}
                      loading="lazy"
                      className={`w-full object-cover transition-transform duration-700 group-hover:scale-[1.06] ${
                        i === 0 ? "aspect-[16/8]" : "aspect-[16/10]"
                      }`}
                    />
                    <span
                      className="absolute inset-0 opacity-25 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-10"
                      style={{ background: d.accent }}
                      aria-hidden
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] accent-ink backdrop-blur">
                      {d.n} · Open now
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <h3 className="display-cond text-[clamp(1.5rem,2.4vw,2.1rem)] text-ink">{d.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.mission}</p>
                    <dl className="mt-6 grid grid-cols-3 gap-3">
                      {d.stats.map((s) => (
                        <div key={s.label}>
                          <dd className="display-cond text-xl accent-ink">
                            <CountUp value={s.value} />
                          </dd>
                          <dt className="text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
                            {s.label}
                          </dt>
                        </div>
                      ))}
                    </dl>
                    <span className="mt-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] accent-ink">
                      Explore {d.short}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── LEGACY ───────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-start">
          <Reveal className="relative lg:sticky lg:top-28">
            <img
              src={legacyAsset.url}
              alt="Worn vintage framing square, folding rule, chisels and a leather tool belt on a weathered workbench"
              width={1600}
              height={1200}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
            <div className="absolute -bottom-6 -right-2 hidden rounded-2xl bg-ink px-6 py-5 text-white shadow-xl sm:block lg:-right-6">
              <p className="rule-label text-white/45">Established</p>
              <p className="display-cond text-4xl gradient-text">{brand.established}</p>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <SectionLabel n="02">The legacy</SectionLabel>
              <DisplayHeading className="mt-6 text-ink">
                A family legacy.
                <br />A new generation.
              </DisplayHeading>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
                McGuire started in 1974 with a small crew, hand tools, and a rule that hasn&rsquo;t changed since: if
                it isn&rsquo;t right, it gets redone. Five decades later the same standard runs five divisions.
              </p>
            </Reveal>
            <ol className="mt-10 space-y-0 border-l border-border pl-6">
              {timeline.map((t, i) => (
                <Reveal as="li" key={t.year} delay={i * 60} className="relative py-5">
                  <span
                    className="absolute -left-[1.72rem] top-7 h-3 w-3 rounded-full ring-4 ring-background"
                    style={{ background: divisions[i % divisions.length].accent }}
                    aria-hidden
                  />
                  <span className="display-cond text-xl text-ink/50">{t.year}</span>
                  <h3 className="mt-1 font-display text-base font-bold text-ink">{t.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                </Reveal>
              ))}
            </ol>
            <div className="mt-9">
              <CTAButton to="/about" variant="secondary" className="rounded-full">
                Read our story
              </CTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────── */}
      <Section wide>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal className="max-w-2xl">
            <SectionLabel n="03">What we build</SectionLabel>
            <DisplayHeading className="mt-6 text-ink">Services</DisplayHeading>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              From ground-up homes to a single well-made built-in — the same crews, the same standards, the same
              accountable team on every scope.
            </p>
          </Reveal>
          <Link to="/services" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:underline">
            All services <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const accent = divisions[i % divisions.length].accent;
            return (
              <Reveal key={s.slug} delay={i * 60}>
                <Link
                  to="/services"
                  hash={s.slug}
                  style={{ ["--accent-color" as string]: accent }}
                  className="group flex h-full flex-col rounded-2xl bg-card p-8 lift-card accent-ring"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl accent-wash display-cond text-lg accent-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold text-ink">{s.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] accent-ink">
                    {s.typical}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* ── BUILT ON SYSTEMS ─────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-border bg-ink text-white">
        <div className="pointer-events-none absolute inset-0 blueprint-grid text-white opacity-70" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <SectionLabel n="04" tone="light">Built on systems</SectionLabel>
            <DisplayHeading className="mt-6 max-w-3xl text-white">
              The same sequence, <span className="gradient-text">every project.</span>
            </DisplayHeading>
            <p className="mt-6 max-w-xl text-white/70">
              Construction goes wrong in the gaps between people. With every trade in-house, there are no gaps —
              just four phases, run the same way whether we&rsquo;re building a deck or a subdivision.
            </p>
          </Reveal>

          <ol className="mt-16 grid gap-5 lg:grid-cols-4">
            {phases.map((p, i) => (
              <Reveal as="li" key={p.n} delay={i * 80}>
                <div
                  className="relative h-full overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-8 transition-colors hover:bg-white/[0.08]"
                  style={{ ["--accent-color" as string]: divisions[i].accent }}
                >
                  <span className="absolute inset-x-0 top-0 h-1 accent-bg" aria-hidden />
                  <div className="flex items-center gap-4">
                    <span className="display-cond text-3xl" style={{ color: divisions[i].accent }}>{p.n}</span>
                    <span className="h-px flex-1 bg-white/15" aria-hidden />
                  </div>
                  <h3 className="display-cond mt-6 text-2xl text-white">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <div className="mt-12">
            <CTAButton to="/process" variant="light" className="rounded-full">
              See the full process <ArrowRight className="h-4 w-4" />
            </CTAButton>
          </div>
        </div>
      </section>

      {/* ── WHY McGUIRE ──────────────────────────────────── */}
      <Section wide>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.25fr]">
          <Reveal>
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
              className="mt-10 aspect-[4/3] w-full rounded-2xl object-cover"
            />
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2">
            {whyMcGuire.map((w, i) => (
              <Reveal key={w.k} delay={i * 70}>
                <div
                  className="h-full rounded-2xl bg-card p-7 lift-card accent-ring"
                  style={{ ["--accent-color" as string]: divisions[i].accent }}
                >
                  <span className="block h-1 w-10 rounded-full accent-bg" aria-hidden />
                  <h3 className="display-cond mt-5 text-xl text-ink">{w.k}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{w.v}</p>
                </div>
              </Reveal>
            ))}
          </div>
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
            {projects.slice(0, 3).map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <Link to="/projects" hash={p.slug} className="group block">
                  <div className="overflow-hidden rounded-2xl bg-muted">
                    <img
                      src={p.image}
                      alt={p.title}
                      width={1600}
                      height={1200}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                  </div>
                  <p className="rule-label mt-5" style={{ color: divisions[i % divisions.length].accent }}>
                    {p.category} · {p.year}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold text-ink">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="pointer-events-none absolute inset-0 blueprint-grid text-white opacity-60" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <SectionLabel n="06" tone="light">The next fifty years</SectionLabel>
          <h2 className="display-cond mt-8 max-w-5xl text-[clamp(2.5rem,8vw,6.5rem)] text-white">
            One call.
            <br />
            <span className="gradient-text">The whole build.</span>
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70">
            Excavation, concrete, construction, landscape, and development — every stage handled by McGuire crews,
            on one schedule, under one warranty.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              to="/contact"
              className="group inline-flex min-h-[52px] items-center gap-2 rounded-full bg-white px-8 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-all hover:shadow-[0_20px_50px_-20px_rgba(255,255,255,0.65)]"
            >
              Start a project
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
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
