import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { CTAButton } from "@/components/site/CTAButton";
import { SystemArchitecture } from "@/components/site/SystemArchitecture";
import { stages } from "@/config/system";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const title = `The System — Detection to Responder | ${brand.name}`;
const desc =
  "Nine stages from a distributed sensor node to information in a responder's hands: detection, alert, 24/7/365 Operations Center, UAV dispatch, autonomous flight, thermal and RGB investigation, and intelligence.";

export const Route = createFileRoute("/system")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/system` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/system` }],
  }),
  component: SystemPage,
});

function SystemPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="The system"
            title="One system. From detection to eyes on the fire."
            lede="Every stage below is being designed as part of a single pipeline. Some of it exists on the bench, some of it exists on paper, and we say which is which."
          />
        </div>
      </div>

      <Section wide>
        <SystemArchitecture />
      </Section>

      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <SectionLabel n="01" tone="light">Stage by stage</SectionLabel>
          <ol className="mt-12 grid gap-px bg-border">
            {stages.map((s) => (
              <li key={s.slug} id={s.slug} className="scroll-mt-28 bg-[var(--night)]">
                <Reveal className="grid gap-8 px-6 py-10 lg:grid-cols-[16rem_1fr_1fr] lg:gap-12 lg:px-10">
                  <div>
                    <span className="display-cond text-[clamp(2.4rem,5vw,4rem)]" style={{ color: s.accent }}>
                      {s.n}
                    </span>
                    <h2 className="mt-2 text-xl font-semibold text-ink">{s.title}</h2>
                    <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                      {s.kicker}
                    </p>
                  </div>
                  <p className="text-base leading-relaxed text-foreground/85">{s.body}</p>
                  <ul className="space-y-2.5">
                    {s.detail.map((d) => (
                      <li key={d} className="flex gap-3 text-sm text-muted-foreground">
                        <span
                          className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: s.accent }}
                          aria-hidden
                        />
                        {d}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <Section wide className="text-center">
        <h2 className="display-cond mx-auto max-w-3xl text-[clamp(2rem,5vw,4rem)] text-ink">
          The integration is the product.
        </h2>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <CTAButton to="/technology" variant="primary">See the technology</CTAButton>
          <CTAButton to="/operations" variant="ghost" className="border border-border text-ink hover:bg-surface">
            The Operations Center
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
