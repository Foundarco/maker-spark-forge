import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import heroImg from "@/assets/cr-hero.jpg";
import impactImg from "@/assets/cr-impact.jpg";
import { brand } from "@/config/brand";
import { programs, regions, stories } from "@/config/programs";
import { Section, SectionLabel, DisplayHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { CTAButton } from "@/components/site/CTAButton";
import { ResponseGlobe } from "@/components/site/ResponseGlobe";
import { SITE_URL } from "@/lib/seo";

const desc =
  "Clovr Relief is a disaster-response nonprofit that reaches cut-off communities within hours — moving water, medical capacity, shelter and power into the field, then staying through recovery.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${brand.name} — ${brand.tagline}` },
      { name: "description", content: desc },
      { property: "og:title", content: `${brand.name} — ${brand.tagline}` },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: `${SITE_URL}/og-home.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE_URL}/og-home.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NGO",
          name: brand.name,
          legalName: brand.legalName,
          url: `${SITE_URL}/`,
          slogan: brand.tagline,
          foundingDate: String(brand.established),
          description: brand.mission,
          email: brand.contact.general,
          telephone: brand.phone,
          areaServed: brand.serviceArea,
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <Situation />
      <Chapters />
      <Reach />
      <Numbers />
      <Field />
      <Closing />
    </>
  );
}

/* ------------------------------------------------------------------ HERO */

function Hero() {
  return (
    <section className="relative isolate flex min-h-[92vh] flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Response aircraft loading emergency supplies on a wet airfield before dawn"
          className="slow-pan h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="scrim-full absolute inset-0" aria-hidden />
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-32 sm:px-8">
        <Reveal>
          <p className="rule-label flex items-center gap-3 text-[var(--aid)]">
            <span className="live-pulse h-1.5 w-1.5 rounded-full bg-[var(--alive)]" aria-hidden />
            Operations center · live
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="display-cond mt-6 max-w-5xl text-[clamp(2.75rem,9vw,7.5rem)] text-ink">
            First light in the worst hours.
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-foreground/80">{brand.mission}</p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-10 flex flex-wrap gap-3">
            <CTAButton to="/donate" variant="primary">
              Give now <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </CTAButton>
            <CTAButton
              to="/response"
              className="border border-border text-ink hover:bg-surface"
              variant="ghost"
            >
              See how we respond
            </CTAButton>
          </div>
        </Reveal>
      </div>

      {/* Meta strip */}
      <div className="border-t border-border/70 bg-[var(--night)]/70 backdrop-blur-sm">
        <dl className="mx-auto grid w-full max-w-7xl grid-cols-2 divide-x divide-border px-5 sm:px-8 lg:grid-cols-4">
          {brand.stats.map((s) => (
            <div key={s.label} className="px-4 py-6 first:pl-0">
              <dt className="rule-label text-muted-foreground">{s.label}</dt>
              <dd className="display-cond mt-2 text-3xl text-ink sm:text-4xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- SITUATION */

function Situation() {
  return (
    <Section wide id="situation">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <SectionLabel n="01" tone="light">The situation</SectionLabel>
          <DisplayHeading className="mt-6 text-ink">
            Disasters are faster.<br />Response has to be too.
          </DisplayHeading>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Storms intensify quicker, floods arrive with less warning, and fire seasons no longer end.
            The old model — assess, appeal, then mobilize — loses the days that matter most.
          </p>
          <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
            We built the opposite. Supplies are already staged. Teams are already rostered. When a
            hazard crosses our activation threshold, the response is already moving.
          </p>
          <div className="mt-9">
            <Link
              to="/mission"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:text-[var(--aid)]"
            >
              Our mission <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        <Reveal className="relative">
          <div className="blueprint-grid relative aspect-square w-full text-foreground/40">
            <ResponseGlobe className="absolute inset-0 h-full w-full" />
          </div>
          <p className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Pre-positioned caches and live responses
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------- CHAPTERS */

function Chapters() {
  return (
    <div className="border-y border-border bg-[var(--night)]">
      <Section wide className="pb-0">
        <SectionLabel n="02" tone="light">The response cycle</SectionLabel>
        <DisplayHeading className="mt-6 max-w-3xl text-ink">
          Detect. Deploy. Deliver. Rebuild.
        </DisplayHeading>
        <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
          Four programs that run as one continuous loop — each one rehearsed before the event, not
          invented during it.
        </p>
      </Section>

      <div>
        {programs.map((p, i) => (
          <article
            key={p.slug}
            id={p.slug}
            className="border-t border-border/70 first:border-t-0"
          >
            <div
              className={`mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24 ${
                i % 2 === 1 ? "lg:[&>figure]:order-2" : ""
              }`}
            >
              <figure className="relative overflow-hidden">
                <img
                  src={p.image}
                  alt={p.imageAlt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                />
                <div className="scrim-bottom pointer-events-none absolute inset-x-0 bottom-0 h-1/3" aria-hidden />
                <figcaption className="absolute bottom-4 left-5 text-xs uppercase tracking-[0.18em] text-foreground/70">
                  {p.discipline}
                </figcaption>
              </figure>

              <Reveal>
                <span className="display-cond block text-6xl leading-none" style={{ color: p.accent }}>
                  {p.n}
                </span>
                <h3 className="display-cond mt-4 text-[clamp(2rem,4.5vw,3.5rem)] text-ink">{p.name}</h3>
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-foreground/80">{p.summary}</p>
                <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">{p.detail}</p>

                <ul className="mt-7 grid gap-px bg-border sm:grid-cols-2">
                  {p.capabilities.map((c) => (
                    <li key={c} className="bg-[var(--night)] px-4 py-3 text-sm text-foreground/75">
                      {c}
                    </li>
                  ))}
                </ul>

                <dl className="mt-7 flex flex-wrap gap-10">
                  {p.stats.map((s) => (
                    <div key={s.label}>
                      <dt className="rule-label text-muted-foreground">{s.label}</dt>
                      <dd className="display-cond mt-1.5 text-3xl text-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- REACH */

function Reach() {
  return (
    <Section wide>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <SectionLabel n="03" tone="light">Where we work</SectionLabel>
          <DisplayHeading className="mt-6 max-w-2xl text-ink">Standing by, season after season.</DisplayHeading>
        </div>
        <Link
          to="/where-we-work"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:text-[var(--aid)]"
        >
          All regions <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <ul className="mt-12 divide-y divide-border border-y border-border">
        {regions.map((r) => (
          <li key={r.name} className="grid gap-2 py-6 sm:grid-cols-[1.2fr_1fr_auto] sm:items-center sm:gap-8">
            <div>
              <p className="font-display text-lg font-semibold text-ink">{r.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.note}</p>
            </div>
            <p className="text-sm text-foreground/70">{r.hazard}</p>
            <StatusChip status={r.status} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

function StatusChip({ status }: { status: string }) {
  const color =
    status === "Active response" ? "var(--signal)" : status === "Recovery" ? "var(--alive)" : "var(--aid)";
  return (
    <span className="inline-flex items-center gap-2 justify-self-start border border-border px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.14em] text-foreground/80">
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "Active response" ? "live-pulse" : ""}`}
        style={{ background: color }}
        aria-hidden
      />
      {status}
    </span>
  );
}

/* --------------------------------------------------------------- NUMBERS */

function Numbers() {
  return (
    <section className="relative isolate overflow-hidden border-y border-border">
      <img
        src={impactImg}
        alt="Aerial view of a flooded coastal town at blue hour"
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-[var(--night)]/85" aria-hidden />
      <Section wide>
        <SectionLabel n="04" tone="light">Accountability</SectionLabel>
        <DisplayHeading className="mt-6 max-w-3xl text-ink">
          Every response publishes its receipts.
        </DisplayHeading>
        <p className="mt-6 max-w-xl leading-relaxed text-foreground/75">
          What was delivered, where it went, and what it cost. Impact reporting is a product here, not
          a press release.
        </p>
        <div className="mt-12">
          <CTAButton to="/impact" variant="primary">
            Read the impact report <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </CTAButton>
        </div>
      </Section>
    </section>
  );
}

/* ----------------------------------------------------------------- FIELD */

function Field() {
  return (
    <Section wide>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <SectionLabel n="05" tone="light">From the field</SectionLabel>
          <DisplayHeading className="mt-6 max-w-2xl text-ink">The work, as it happened.</DisplayHeading>
        </div>
        <Link
          to="/stories"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:text-[var(--aid)]"
        >
          All stories <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-12 grid gap-px bg-border md:grid-cols-3">
        {stories.map((s) => (
          <Link
            key={s.slug}
            to="/stories/$slug"
            params={{ slug: s.slug }}
            className="group flex flex-col bg-background transition-colors hover:bg-surface"
          >
            <div className="overflow-hidden">
              <img
                src={s.image}
                alt={s.imageAlt}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="rule-label text-muted-foreground">
                {s.place} · {s.year}
              </p>
              <h3 className="mt-3 font-display text-xl font-bold text-ink">{s.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Read <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- CLOSING */

function Closing() {
  return (
    <section className="border-t border-border bg-[var(--night)]">
      <Section wide className="text-center">
        <SectionLabel n="06" tone="light" className="justify-center">Get involved</SectionLabel>
        <DisplayHeading className="mx-auto mt-6 max-w-4xl text-ink">
          The next event is already forming.
        </DisplayHeading>
        <p className="mx-auto mt-6 max-w-xl leading-relaxed text-muted-foreground">
          Funding pre-positioned supply is the single highest-leverage thing anyone can do. It buys
          hours — and hours are what save lives.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <CTAButton to="/donate" variant="primary">
            Give now <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </CTAButton>
          <CTAButton to="/volunteer" variant="ghost" className="border border-border text-ink hover:bg-surface">
            Volunteer
          </CTAButton>
          <CTAButton to="/partners" variant="ghost" className="border border-border text-ink hover:bg-surface">
            Partner with us
          </CTAButton>
        </div>
      </Section>
    </section>
  );
}
