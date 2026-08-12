import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { programs, stories } from "@/config/programs";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";
import { Link } from "@tanstack/react-router";

const desc =
  "Clovr Relief impact reporting: people reached, tonnes delivered, homes repaired, responders trained, and how funds are allocated across programs.";
const title = `Impact & Accountability — ${brand.name}`;

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/impact` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/impact` }],
  }),
  component: ImpactPage,
});

const allocation = [
  { label: "Field programs & supply", pct: 68 },
  { label: "Logistics & transport", pct: 15 },
  { label: "Recovery & resilience", pct: 8 },
  { label: "Operations center", pct: 6 },
  { label: "Fundraising & admin", pct: 3 },
];

function ImpactPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="Impact"
            title="Published, not promised."
            lede="Every response is reported against what it delivered and what it cost. These are the cumulative figures since our first deployment."
          />
        </div>
      </div>

      <Section wide>
        <dl className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {brand.stats.map((s) => (
            <div key={s.label} className="bg-background p-7">
              <dt className="rule-label text-muted-foreground">{s.label}</dt>
              <dd className="display-cond mt-3 text-4xl text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <SectionLabel n="01" tone="light">By program</SectionLabel>
          <div className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {programs.map((p) => (
              <article key={p.slug} className="bg-[var(--night)] p-7">
                <span className="display-cond text-3xl" style={{ color: p.accent }}>{p.n}</span>
                <h2 className="mt-3 font-display text-lg font-bold text-ink">{p.name}</h2>
                <dl className="mt-5 space-y-4">
                  {p.stats.map((s) => (
                    <div key={s.label}>
                      <dt className="rule-label text-muted-foreground">{s.label}</dt>
                      <dd className="display-cond mt-1 text-2xl text-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </Section>
      </div>

      <Section wide>
        <SectionLabel n="02" tone="light">Allocation of funds</SectionLabel>
        <ul className="mt-10 space-y-5">
          {allocation.map((a) => (
            <li key={a.label}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm text-foreground/80">{a.label}</span>
                <span className="display-cond text-xl text-ink">{a.pct}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-surface">
                <div className="h-full bg-primary" style={{ width: `${a.pct}%` }} aria-hidden />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
          Figures are drawn from our most recent audited financial year and are restated each year
          alongside the annual report.
        </p>
      </Section>

      <div className="border-t border-border bg-[var(--night)]">
        <Section wide>
          <SectionLabel n="03" tone="light">Responses in detail</SectionLabel>
          <ul className="mt-10 divide-y divide-border border-y border-border">
            {stories.map((s) => (
              <li key={s.slug}>
                <Link
                  to="/stories/$slug"
                  params={{ slug: s.slug }}
                  className="grid gap-3 py-6 transition-colors hover:bg-surface sm:grid-cols-[1.4fr_1fr_auto] sm:items-center sm:gap-8"
                >
                  <div>
                    <h2 className="font-display text-lg font-semibold text-ink">{s.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{s.summary}</p>
                  </div>
                  <p className="text-sm text-foreground/70">{s.place} · {s.year}</p>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Read</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-12">
            <CTAButton to="/donate" variant="primary">Fund the next response</CTAButton>
          </div>
        </Section>
      </div>
    </>
  );
}
