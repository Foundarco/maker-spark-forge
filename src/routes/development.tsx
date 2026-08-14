import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { CTAButton } from "@/components/site/CTAButton";
import { phases, expansion } from "@/config/system";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";

const title = `Development Status | ${brand.name}`;
const desc =
  "An honest development timeline: research, system design, prototype, field testing, pilot, and eventual deployment. Nothing is operationally deployed yet.";

export const Route = createFileRoute("/development")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/development` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/development` }],
  }),
  component: DevelopmentPage,
});

function DevelopmentPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="Development status"
            title="Building it in public."
            lede="We are an early-stage organization. Nothing described on this site is operationally deployed. Here is exactly where the programme stands and what has to happen next."
          />
        </div>
      </div>

      <Section wide>
        <ol className="grid gap-px border border-border bg-border">
          {phases.map((p) => (
            <li key={p.n} className="bg-[var(--night)]">
              <Reveal className="grid gap-6 px-6 py-8 sm:grid-cols-[6rem_1fr_10rem] sm:items-start sm:gap-10 sm:px-10">
                <span className="display-cond text-[clamp(2.2rem,4vw,3.4rem)] text-[var(--signal)]">{p.n}</span>
                <div>
                  <h2 className="text-xl font-semibold text-ink">{p.title}</h2>
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
                <span
                  className={`justify-self-start border px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.16em] sm:justify-self-end ${
                    p.state === "Ahead"
                      ? "border-border text-muted-foreground"
                      : "border-[color:var(--signal)]/50 text-[var(--signal)]"
                  }`}
                >
                  {p.state}
                </span>
              </Reveal>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xs text-muted-foreground">
          No stage is marked complete. Stages marked "Ahead" have not started and have no committed dates.
        </p>
      </Section>

      <div className="border-y border-border bg-[var(--night)]">
        <Section wide>
          <div className="grid gap-14 lg:grid-cols-2">
            <Reveal>
              <SectionLabel n="01" tone="light">What is true today</SectionLabel>
              <ul className="mt-8 space-y-3 text-base text-foreground/85">
                {[
                  "We are developing a wildfire detection and UAV response system.",
                  "We are developing supporting sensor, software, aerospace, and robotics technologies.",
                  "Wildfire is our first major mission.",
                  "The organization operates a 24/7/365 Operations Center.",
                ].map((x) => (
                  <li key={x} className="flex gap-3">
                    <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#4ade80]" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120}>
              <SectionLabel n="02" tone="light">What is not true yet</SectionLabel>
              <ul className="mt-8 space-y-3 text-base text-muted-foreground">
                {[
                  "No sensor network is deployed in the field.",
                  "No aircraft fleet is in operational service.",
                  "No fires have been detected or responded to by this system.",
                  "No response times, coverage areas, or performance figures exist to publish.",
                ].map((x) => (
                  <li key={x} className="flex gap-3">
                    <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--signal)]" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted-foreground">
                When any of that changes, this page changes first.
              </p>
            </Reveal>
          </div>
        </Section>
      </div>

      <Section>
        <Reveal>
          <SectionLabel n="03" tone="light">Later, not now</SectionLabel>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Wildfire is only the beginning.</h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            The same foundation could eventually serve other emergencies. That is a direction, not a roadmap — the
            wildfire system comes first.
          </p>
          <ul className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {expansion.map((e) => (
              <li key={e.title} className="bg-[var(--night)] px-5 py-6">
                <p className="text-sm font-semibold text-ink">{e.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{e.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
        <div className="mt-12 flex flex-wrap gap-3">
          <CTAButton to="/join" variant="primary">Build with us</CTAButton>
          <CTAButton to="/donate" variant="ghost" className="border border-border text-ink hover:bg-surface">
            Support the mission
          </CTAButton>
        </div>
      </Section>
    </>
  );
}
