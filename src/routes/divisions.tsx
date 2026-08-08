import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader, SectionLabel, DisplayHeading } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { divisions, statusTone } from "@/config/divisions";
import { brand } from "@/config/brand";

const title = "The McGuire Group — Divisions | McGuire Construction";
const description =
  "Five divisions, one organization. Construction today; concrete, excavation, landscape, and development as McGuire builds toward full vertical integration.";

export const Route = createFileRoute("/divisions")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clovrlab.com/divisions" },
      { property: "og:image", content: divisions[0].image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: divisions[0].image },
    ],
    links: [{ rel: "canonical", href: "https://clovrlab.com/divisions" }],
  }),
  component: DivisionsPage,
});

function DivisionsPage() {
  return (
    <>
      <section className="border-b border-border bg-warm">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <PageHeader
            eyebrow="The McGuire Group"
            title={
              <span className="display-cond block text-[clamp(2.5rem,7vw,5.5rem)]">
                One organization.
                <br />
                Five divisions.
              </span>
            }
            lede={`McGuire is being built as a vertically integrated construction organization. Construction is live today. Each division that follows brings another stage of the build under our own roof — our crews, our schedule, our standards.`}
          />
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <ul>
          {divisions.map((d) => (
            <li key={d.slug} className="border-b border-border">
              <Link
                to="/divisions/$slug"
                params={{ slug: d.slug }}
                className="group grid gap-8 py-12 transition-colors lg:grid-cols-[7rem_1fr_22rem] lg:items-center lg:gap-10"
              >
                <span className="display-cond text-4xl text-ink/20 transition-colors group-hover:text-ink/50">
                  {d.n}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="display-cond text-[clamp(1.75rem,3.5vw,2.75rem)] text-ink">{d.name}</h2>
                    <span className={`rule-label border px-2.5 py-1 ${statusTone[d.status]}`}>{d.status}</span>
                  </div>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{d.mission}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                    Explore division
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
                <div className="overflow-hidden bg-muted">
                  <img
                    src={d.image}
                    alt={d.imageAlt}
                    width={1600}
                    height={1200}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="relative overflow-hidden bg-ink px-8 py-16 text-white sm:px-14 sm:py-20">
          <div className="pointer-events-none absolute inset-0 blueprint-grid text-white opacity-60" aria-hidden />
          <div className="relative">
            <SectionLabel tone="light">This is only the beginning</SectionLabel>
            <DisplayHeading className="mt-6 max-w-3xl text-white">
              Built since {brand.established}. Built for what&rsquo;s next.
            </DisplayHeading>
            <p className="mt-6 max-w-xl text-white/70">
              Every division we add removes a handoff, a delay, and a point of failure. The end state is simple:
              McGuire self-performs the whole build.
            </p>
            <div className="mt-10">
              <CTAButton to="/contact" variant="light">
                Start a project <ArrowRight className="h-4 w-4" />
              </CTAButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
