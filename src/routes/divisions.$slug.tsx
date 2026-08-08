import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { SectionLabel, DisplayHeading } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { divisions, getDivision, statusTone } from "@/config/divisions";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/divisions/$slug")({
  loader: ({ params }) => {
    const division = getDivision(params.slug);
    if (!division) throw notFound();
    return { division };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Division not found — McGuire Construction" }, { name: "robots", content: "noindex" }] };
    }
    const d = loaderData.division;
    const title = `${d.name} — ${d.status} | McGuire Construction`;
    const url = `https://clovrlab.com/divisions/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: d.mission },
        { property: "og:title", content: title },
        { property: "og:description", content: d.mission },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:image", content: d.image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: d.image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://clovrlab.com/" },
              { "@type": "ListItem", position: 2, name: "Divisions", item: "https://clovrlab.com/divisions" },
              { "@type": "ListItem", position: 3, name: d.name, item: url },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: DivisionNotFound,
  component: DivisionDetail,
});

function DivisionNotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-32 sm:px-8">
      <h1 className="display-cond text-5xl text-ink">Division not found</h1>
      <p className="mt-4 text-muted-foreground">That division isn&rsquo;t part of the McGuire Group.</p>
      <div className="mt-8">
        <CTAButton to="/divisions" variant="secondary">
          <ArrowLeft className="h-4 w-4" /> All divisions
        </CTAButton>
      </div>
    </div>
  );
}

function DivisionDetail() {
  const { division: d } = Route.useLoaderData();
  const others = divisions.filter((x) => x.slug !== d.slug);

  return (
    <>
      {/* HERO */}
      <section className="relative border-b border-border bg-ink text-white">
        <img
          src={d.image}
          alt={d.imageAlt}
          width={1600}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <Link
            to="/divisions"
            className="rule-label inline-flex items-center gap-2 text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> The McGuire Group
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="display-cond text-4xl text-white/35">{d.n}</span>
            <span className="rule-label border border-white/40 px-2.5 py-1 text-white/80">{d.status}</span>
          </div>
          <DisplayHeading as="h1" className="mt-5 max-w-4xl text-white">
            {d.name}
          </DisplayHeading>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">{d.tagline}</p>
        </div>
      </section>

      {/* MISSION */}
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1.3fr]">
          <SectionLabel n="01">Mission</SectionLabel>
          <div>
            <p className="text-2xl leading-snug text-ink sm:text-3xl">{d.mission}</p>
            <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">{d.intro}</p>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="border-b border-border bg-warm">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1.3fr]">
          <SectionLabel n="02">Capabilities</SectionLabel>
          <ul className="divide-y divide-border border-y border-border">
            {d.capabilities.map((c) => (
              <li key={c} className="flex items-center gap-4 py-4 text-lg text-ink">
                <span className="rule-label w-6 shrink-0 text-muted-foreground">
                  {String(d.capabilities.indexOf(c) + 1).padStart(2, "0")}
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* BUILDING TOWARD */}
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1.3fr]">
          <SectionLabel n="03">What we&rsquo;re building toward</SectionLabel>
          <ul className="grid gap-px bg-border sm:grid-cols-3">
            {d.buildingToward.map((b) => (
              <li key={b} className="bg-card p-7">
                <Check className="h-5 w-5 text-ink" aria-hidden />
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* OTHER DIVISIONS */}
      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <SectionLabel n="04">Other divisions</SectionLabel>
        <ul className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                to="/divisions/$slug"
                params={{ slug: o.slug }}
                className="group flex h-full flex-col bg-card p-7 transition-colors hover:bg-warm"
              >
                <span className="display-cond text-2xl text-ink/25">{o.n}</span>
                <span className="mt-3 font-display text-lg font-bold text-ink">{o.short}</span>
                <span className={`rule-label mt-2 inline-flex w-fit border px-2 py-0.5 ${statusTone[o.status]}`}>
                  {o.status}
                </span>
                <ArrowRight className="mt-6 h-4 w-4 text-ink transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-ink text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <DisplayHeading className="max-w-2xl text-white">Tell us what you want to build.</DisplayHeading>
          <div className="flex flex-col gap-3">
            <CTAButton to="/contact" variant="light">
              Start a project <ArrowRight className="h-4 w-4" />
            </CTAButton>
            <a
              href={`tel:${brand.phone.replace(/[^0-9+]/g, "")}`}
              className="text-sm text-white/60 hover:text-white"
            >
              Or call {brand.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
