import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader, SectionLabel, DisplayHeading } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { Reveal } from "@/components/site/Reveal";
import { CountUp } from "@/components/site/CountUp";
import { divisions } from "@/config/divisions";
import { brand } from "@/config/brand";

const title = "The McGuire Group — Five open divisions | McGuire Construction";
const description =
  "Five divisions, one organization. Construction, concrete, excavation, landscape, and development — all open, all in-house, all self-performed by McGuire.";

export const Route = createFileRoute("/divisions/")({
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
      <section className="relative overflow-hidden border-b border-border bg-warm">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-25 blur-3xl float-slow"
          style={{ background: "radial-gradient(circle, var(--acc-construction), transparent 65%)" }}
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <PageHeader
              eyebrow="The McGuire Group"
              title={
                <span className="display-cond block text-[clamp(2.5rem,7vw,5.5rem)]">
                  One organization.
                  <br />
                  <span className="gradient-text">Five open divisions.</span>
                </span>
              }
              lede="McGuire is a vertically integrated construction organization. Every division is staffed, equipped, and taking work today — our crews, our schedule, our standards, from raw ground to finished property."
            />
          </Reveal>
          <div className="mt-12 flex flex-wrap gap-3">
            {divisions.map((d) => (
              <a
                key={d.slug}
                href={`#${d.slug}`}
                style={{ ["--accent-color" as string]: d.accent }}
                className="rounded-full accent-wash px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] accent-ink transition-transform hover:-translate-y-0.5"
              >
                {d.short}
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <ul className="grid gap-8">
          {divisions.map((d, i) => (
            <Reveal as="li" key={d.slug} delay={i * 60}>
              <div id={d.slug} className="scroll-mt-28">
                <Link
                  to="/divisions/$slug"
                  params={{ slug: d.slug }}
                  style={{ ["--accent-color" as string]: d.accent }}
                  className={`group grid overflow-hidden rounded-3xl bg-card lift-card accent-ring lg:grid-cols-2 ${
                    i % 2 === 1 ? "lg:[&>figure]:order-last" : ""
                  }`}
                >
                  <figure className="relative m-0 overflow-hidden">
                    <img
                      src={d.image}
                      alt={d.imageAlt}
                      width={1600}
                      height={1200}
                      loading="lazy"
                      className="aspect-[16/10] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                    <span
                      className="absolute inset-0 opacity-25 mix-blend-multiply transition-opacity group-hover:opacity-10"
                      style={{ background: d.accent }}
                      aria-hidden
                    />
                    <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] accent-ink backdrop-blur">
                      {d.n} · Open now
                    </span>
                  </figure>
                  <div className="flex flex-col justify-center p-8 sm:p-12">
                    <h2 className="display-cond text-[clamp(1.9rem,3.6vw,3rem)] text-ink">{d.name}</h2>
                    <p className="mt-2 text-sm font-semibold accent-ink">{d.tagline}</p>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">{d.mission}</p>
                    <dl className="mt-7 grid grid-cols-3 gap-4">
                      {d.stats.map((s) => (
                        <div key={s.label}>
                          <dd className="display-cond text-2xl accent-ink">
                            <CountUp value={s.value} />
                          </dd>
                          <dt className="text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
                            {s.label}
                          </dt>
                        </div>
                      ))}
                    </dl>
                    <ul className="mt-7 flex flex-wrap gap-2">
                      {d.capabilities.slice(0, 4).map((c) => (
                        <li key={c} className="rounded-full accent-wash px-3 py-1.5 text-xs accent-ink">
                          {c}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] accent-ink">
                      Explore division
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>

      <section className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-16 text-white sm:px-14 sm:py-20">
          <div className="pointer-events-none absolute inset-0 blueprint-grid text-white opacity-60" aria-hidden />
          <div className="relative">
            <SectionLabel tone="light">One builder, every stage</SectionLabel>
            <DisplayHeading className="mt-6 max-w-3xl text-white">
              Built since {brand.established}. <span className="gradient-text">Built complete.</span>
            </DisplayHeading>
            <p className="mt-6 max-w-xl text-white/70">
              Every division removes a handoff, a delay, and a point of failure. McGuire self-performs the whole
              build — and answers for all of it.
            </p>
            <div className="mt-10">
              <CTAButton to="/contact" variant="light" className="rounded-full">
                Start a project <ArrowRight className="h-4 w-4" />
              </CTAButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
