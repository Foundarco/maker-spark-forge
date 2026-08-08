import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionHeading } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { divisions } from "@/config/divisions";
import { services } from "@/config/site-content";
import { ArrowRight } from "lucide-react";

const desc =
  "New home construction, additions, whole-home renovations, kitchens and baths, custom carpentry, and exteriors — built by McGuire Construction's own crews.";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: `Services — ${brand.name}` },
      { name: "description", content: desc },
      { property: "og:title", content: `Services — ${brand.name}` },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clovrlab.com/services" },
      { property: "og:image", content: divisions[0].image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: divisions[0].image },
    ],
    links: [{ rel: "canonical", href: "https://clovrlab.com/services" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Services — ${brand.name}`,
          description: desc,
          url: "https://clovrlab.com/services",
          mainEntity: {
            "@type": "ItemList",
            itemListElement: services.map((s: any, i: number) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Service",
                name: s.title ?? s.name,
                description: s.description ?? s.blurb ?? undefined,
                provider: { "@type": "GeneralContractor", name: brand.name },
              },
            })),
          },
        }),
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <PageHeader
            eyebrow="Services"
            title="What we build."
            lede="Six core disciplines, all staffed by our own crews and managed by one project lead from first measurement to final punch list."
          />
        </div>
      </div>

      <Section wide>
        <div className="space-y-24">
          {services.map((s, i) => (
            <article
              key={s.slug}
              id={s.slug}
              className="grid scroll-mt-28 gap-10 lg:grid-cols-2 lg:items-center"
            >
              <img
                src={s.image}
                alt={s.title}
                width={1600}
                height={1200}
                loading="lazy"
                className={`aspect-[4/3] w-full object-cover ${i % 2 === 1 ? "lg:order-2" : ""}`}
              />
              <div>
                <p className="rule-label text-muted-foreground">Typical duration · {s.typical}</p>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                  {s.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">{s.summary}</p>
                <ul className="mt-8 divide-y divide-border border-y border-border">
                  {s.scope.map((item) => (
                    <li key={item} className="flex items-start gap-3 py-3 text-sm text-foreground">
                      <span className="mt-2 h-px w-4 shrink-0 bg-primary" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <CTAButton to="/contact" variant="secondary">
                    Ask about {s.title.toLowerCase()} <ArrowRight className="h-4 w-4" />
                  </CTAButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <section className="border-t border-border bg-warm">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
          <SectionHeading
            eyebrow="Not sure where it fits?"
            title="Describe the project and we'll tell you straight."
            lede="If it isn't work we should be doing, we'll say so and point you toward someone who should."
          />
          <div className="mt-8">
            <CTAButton to="/contact" variant="primary">
              Request an estimate <ArrowRight className="h-4 w-4" />
            </CTAButton>
          </div>
        </div>
      </section>
    </>
  );
}
