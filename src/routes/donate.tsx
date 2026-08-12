import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { CTAButtonBtn } from "@/components/site/CTAButton";
import { giveTiers } from "@/config/programs";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";
import { Check } from "lucide-react";

const desc =
  "Give to Clovr Relief. Donations fund pre-positioned emergency supplies, medical resupply, shelter kits, and long-term recovery crews — 91% of every dollar goes to programs.";
const title = `Give — ${brand.name}`;

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/donate` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/donate` }],
  }),
  component: DonatePage,
});

function DonatePage() {
  const [selected, setSelected] = useState(giveTiers[1]?.amount ?? "");
  const [frequency, setFrequency] = useState<"once" | "monthly">("monthly");

  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <PageHeader
            eyebrow="Give"
            title="Fund the hours before the storm."
            lede="Recurring gifts are what keep caches stocked out of season — the single highest-leverage way to shorten a response."
          />
        </div>
      </div>

      <Section wide>
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionLabel n="01" tone="light">Choose a gift</SectionLabel>

            <div className="mt-8 inline-flex border border-border">
              {(["monthly", "once"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  aria-pressed={frequency === f}
                  className={`min-h-[44px] px-6 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                    frequency === f ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-ink"
                  }`}
                >
                  {f === "monthly" ? "Monthly" : "One time"}
                </button>
              ))}
            </div>

            <ul className="mt-8 grid gap-px bg-border sm:grid-cols-2">
              {giveTiers.map((t) => {
                const active = selected === t.amount;
                return (
                  <li key={t.amount}>
                    <button
                      type="button"
                      onClick={() => setSelected(t.amount)}
                      aria-pressed={active}
                      className={`flex h-full w-full flex-col items-start p-6 text-left transition-colors ${
                        active ? "bg-surface" : "bg-background hover:bg-surface"
                      }`}
                    >
                      <span className="flex w-full items-center justify-between">
                        <span className="display-cond text-3xl text-ink">{t.amount}</span>
                        {active ? <Check className="h-4 w-4 text-primary" aria-hidden /> : null}
                      </span>
                      <span className="rule-label mt-3 text-primary">{t.label}</span>
                      <span className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.effect}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8">
              <CTAButtonBtn
                variant="primary"
                onClick={() => {
                  window.location.href = `mailto:${brand.contact.general}?subject=${encodeURIComponent(
                    `${frequency === "monthly" ? "Monthly" : "One-time"} gift — ${selected}`,
                  )}`;
                }}
              >
                Continue with {selected} {frequency === "monthly" ? "per month" : "once"}
              </CTAButtonBtn>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                Online card processing is being finalized. Until then, continue here and our development
                team will complete your gift directly.
              </p>
            </div>
          </div>

          <aside className="border border-border bg-surface p-8">
            <SectionLabel n="02" tone="light">Other ways to give</SectionLabel>
            <dl className="mt-8 space-y-7">
              <div>
                <dt className="font-display text-lg font-bold text-ink">Wire or check</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Contact{" "}
                  <a className="text-primary hover:underline" href={`mailto:${brand.contact.general}`}>
                    {brand.contact.general}
                  </a>{" "}
                  for banking details and acknowledgement letters.
                </dd>
              </div>
              <div>
                <dt className="font-display text-lg font-bold text-ink">Corporate matching</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Most employers will match a gift dollar for dollar. Our{" "}
                  <a className="text-primary hover:underline" href={`mailto:${brand.contact.partners}`}>
                    partnerships team
                  </a>{" "}
                  will handle the paperwork.
                </dd>
              </div>
              <div>
                <dt className="font-display text-lg font-bold text-ink">In-kind supply</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  We accept water treatment, medical, shelter, and power equipment that matches cache
                  standards. Transport capacity is equally welcome.
                </dd>
              </div>
            </dl>
            <p className="mt-9 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
              {brand.legalName} is a nonprofit organization. Gifts are acknowledged in writing; tax
              treatment depends on your jurisdiction.
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
