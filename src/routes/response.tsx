import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { Reveal } from "@/components/site/Reveal";
import { programs } from "@/config/programs";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";
import { ArrowRight } from "lucide-react";

const desc =
  "How Clovr Relief responds to natural disasters: continuous hazard monitoring, pre-positioned caches, rostered teams, household-level delivery, and long-term recovery.";
const title = `How We Respond — ${brand.name}`;

export const Route = createFileRoute("/response")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/response` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/response` }],
  }),
  component: ResponsePage,
});

const timeline = [
  { t: "T-72h", label: "Watch", body: "Hazard feeds cross a watch threshold. Regional caches confirm stock and staffing." },
  { t: "T-24h", label: "Stage", body: "Supplies move toward the projected impact zone. Teams placed on recall." },
  { t: "T+0", label: "Impact", body: "Situational picture shared with local agencies as damage reports arrive." },
  { t: "T+6h", label: "First delivery", body: "Water, medical, and shelter reach the first cut-off households." },
  { t: "T+72h", label: "Scale", body: "Distribution widens with local partners; case files opened per household." },
  { t: "Week 3+", label: "Recovery", body: "Repair crews, cash assistance, and readiness training take over." },
];

function ResponsePage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="How we respond"
            title="A response that starts before the event does."
            lede="Four programs run as one loop. Each is rehearsed, resourced, and staged in advance so the first hours are spent delivering, not deciding."
          />
        </div>
      </div>

      <Section wide>
        <SectionLabel n="01" tone="light">Timeline of a response</SectionLabel>
        <ol className="mt-10 grid gap-px bg-border md:grid-cols-3">
          {timeline.map((s) => (
            <li key={s.t} className="bg-background p-6">
              <p className="display-cond text-2xl text-primary">{s.t}</p>
              <h2 className="mt-2 font-display text-lg font-bold text-ink">{s.label}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <div className="border-t border-border bg-[var(--night)]">
        {programs.map((p, i) => (
          <article key={p.slug} id={p.slug} className="border-b border-border/70 scroll-mt-24">
            <div
              className={`mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 ${
                i % 2 === 1 ? "lg:[&>figure]:order-2" : ""
              }`}
            >
              <figure className="overflow-hidden">
                <img
                  src={p.image}
                  alt={p.imageAlt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </figure>
              <Reveal>
                <span className="display-cond block text-5xl leading-none" style={{ color: p.accent }}>
                  {p.n}
                </span>
                <h2 className="display-cond mt-3 text-[clamp(1.9rem,4vw,3rem)] text-ink">{p.name}</h2>
                <p className="rule-label mt-3 text-muted-foreground">{p.discipline}</p>
                <p className="mt-6 max-w-lg leading-relaxed text-foreground/80">{p.summary}</p>
                <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">{p.detail}</p>
                <ul className="mt-7 space-y-2">
                  {p.capabilities.map((c) => (
                    <li key={c} className="flex gap-3 text-sm text-foreground/75">
                      <span className="mt-2 h-px w-5 shrink-0 bg-border" aria-hidden />
                      {c}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </article>
        ))}
      </div>

      <Section wide className="text-center">
        <h2 className="display-cond mx-auto max-w-3xl text-[clamp(2rem,5vw,4rem)] text-ink">
          Hours are bought in advance.
        </h2>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <CTAButton to="/donate" variant="primary">
            Fund a cache <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </CTAButton>
          <CTAButton to="/where-we-work" variant="ghost" className="border border-border text-ink hover:bg-surface">
            Where we work
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
