import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section, PageHeader } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { projects } from "@/config/site-content";
import { ArrowRight } from "lucide-react";
import heroAsset from "@/assets/mg-hero.jpg.asset.json";

const desc =
  "Completed McGuire Construction projects: custom homes, additions, whole-home renovations, kitchens, decks, and custom millwork.";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: `Projects — ${brand.name}` },
      { name: "description", content: desc },
      { property: "og:title", content: `Projects — ${brand.name}` },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clovrlab.com/projects" },
      { property: "og:image", content: heroAsset.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroAsset.url },
    ],
    links: [{ rel: "canonical", href: "https://clovrlab.com/projects" }],
  }),
  component: ProjectsPage,
});

const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

function ProjectsPage() {
  const [active, setActive] = useState("All");
  const visible = active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <PageHeader
            eyebrow="Projects"
            title="Work you can walk through."
            lede="A sample of recent builds. Every one of these owners is available as a reference — ask and we'll connect you."
          />
        </div>
      </div>

      <Section wide>
        <div className="flex flex-wrap gap-2 border-b border-border pb-6">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                active === c
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-12 md:grid-cols-2">
          {visible.map((p) => (
            <article key={p.slug} id={p.slug} className="scroll-mt-28">
              <div className="overflow-hidden bg-muted">
                <img
                  src={p.image}
                  alt={p.title}
                  width={1600}
                  height={1200}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <p className="rule-label mt-6 text-muted-foreground">
                {p.category} · {p.location} · {p.year}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink">{p.title}</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{p.summary}</p>
              <dl className="mt-6 grid grid-cols-3 gap-px border border-border bg-border">
                {p.stats.map((s) => (
                  <div key={s.label} className="bg-card px-4 py-4">
                    <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">{s.label}</dt>
                    <dd className="mt-1 font-display text-base font-bold text-ink">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </Section>

      <section className="border-t border-border bg-warm">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-16 sm:px-8">
          <h2 className="max-w-xl font-display text-2xl font-bold text-ink sm:text-3xl">
            Want to see one of these in person?
          </h2>
          <CTAButton to="/contact" variant="primary">
            Request an estimate <ArrowRight className="h-4 w-4" />
          </CTAButton>
        </div>
      </section>
    </>
  );
}
