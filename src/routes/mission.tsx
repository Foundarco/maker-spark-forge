import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";
import opsImg from "@/assets/cr-ops.jpg";

const desc =
  "The mission and operating principles behind Clovr Relief: speed as survival, local-first deployment, engineered logistics, and accountability to every dollar.";
const title = `Our Mission — ${brand.name}`;

export const Route = createFileRoute("/mission")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/mission` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/mission` }],
  }),
  component: MissionPage,
});

function MissionPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <img
          src={opsImg}
          alt="Responders monitoring storm tracking screens in a darkened operations center"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[var(--night)]/85" aria-hidden />
        <div className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <PageHeader
            eyebrow="Mission"
            title="Reach people before the window closes."
            lede={brand.mission}
          />
        </div>
      </section>

      <Section wide>
        <SectionLabel n="01" tone="light">Principles</SectionLabel>
        <div className="mt-10 grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {brand.values.map((v) => (
            <article key={v.title} className="bg-background p-7">
              <h2 className="font-display text-xl font-bold text-ink">{v.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <SectionLabel n="02" tone="light">Where the money goes</SectionLabel>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <p className="text-lg leading-relaxed text-foreground/80">
              Ninety-one cents of every dollar funds programs: supplies in caches, aircraft and
              convoys in motion, medical resupply, and the recovery crews who stay for months after
              the event. The remainder covers the operations center and the auditing that keeps this
              claim honest.
            </p>
            <dl className="grid gap-px bg-border sm:grid-cols-2">
              {brand.stats.map((s) => (
                <div key={s.label} className="bg-[var(--night)] p-6">
                  <dt className="rule-label text-muted-foreground">{s.label}</dt>
                  <dd className="display-cond mt-2 text-3xl text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>
      </div>

      <Section wide className="text-center">
        <h2 className="display-cond mx-auto max-w-3xl text-[clamp(2rem,5vw,4rem)] text-ink">
          Support the hours that matter.
        </h2>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <CTAButton to="/donate" variant="primary">Give now</CTAButton>
          <CTAButton to="/impact" variant="ghost" className="border border-border text-ink hover:bg-surface">
            See the impact
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
