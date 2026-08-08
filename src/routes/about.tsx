import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionHeading } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { ArrowRight } from "lucide-react";
import carpentryAsset from "@/assets/mg-carpentry.jpg.asset.json";
import remodelAsset from "@/assets/mg-remodel.jpg.asset.json";

const desc = `A family-run general contractor since ${brand.established}. How McGuire Construction started, who runs the crews, and the standards we hold every job to.`;

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${brand.name}` },
      { name: "description", content: desc },
      { property: "og:title", content: `About — ${brand.name}` },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clovrlab.com/about" },
      { property: "og:image", content: remodelAsset.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: remodelAsset.url },
    ],
    links: [{ rel: "canonical", href: "https://clovrlab.com/about" }],
  }),
  component: AboutPage,
});

const timeline = [
  { year: "1995", body: "Dan McGuire starts framing houses out of a single truck, taking work by referral only." },
  { year: "2003", body: "First full crew hired. The company moves into additions and structural remodels." },
  { year: "2011", body: "A dedicated millwork shop opens, bringing cabinetry and trim work in-house." },
  { year: "2018", body: "Second generation joins the business and formalizes scheduling and estimating systems." },
  { year: "Today", body: "Three field crews, an in-house shop, and a project management system clients can see into." },
];

function AboutPage() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <PageHeader
            eyebrow={`Family-run since ${brand.established}`}
            title="Three decades of doing it the same careful way."
            lede="McGuire Construction started with one truck and a reputation for finishing what was promised. Thirty years later, the crews are bigger and the systems are better — the standard hasn't moved."
          />
          <img
            src={remodelAsset.url}
            alt="A completed interior renovation with oak flooring and exposed beams"
            width={1600}
            height={1200}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      </div>

      <Section wide>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading eyebrow="Our story" title="Built on referrals, not advertising." />
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              The company began in {brand.established} with residential framing. There was no marketing budget and
              no sales team — the only way to get the next job was to finish the last one properly and let the
              homeowner tell a neighbor.
            </p>
            <p>
              That constraint shaped everything. We priced honestly because we'd see those clients again. We
              cleaned the site because the neighbors were watching. We wrote things down because memory isn't a
              contract. Nearly three quarters of the work we take on today still comes from a past client or a
              referral from one.
            </p>
            <p>
              The second generation runs day-to-day operations now. What changed is the infrastructure —
              scheduling, estimating, and documentation are formal systems rather than a notebook in a truck.
              What didn't change is who is responsible when something isn't right.
            </p>
          </div>
        </div>
      </Section>

      <section className="border-y border-border bg-warm">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
          <SectionHeading eyebrow="Timeline" title="Thirty years, in order." />
          <ol className="mt-12 border-t border-border">
            {timeline.map((t) => (
              <li key={t.year} className="grid gap-4 border-b border-border py-6 sm:grid-cols-[8rem_1fr]">
                <p className="font-display text-lg font-bold text-ink">{t.year}</p>
                <p className="text-base leading-relaxed text-muted-foreground">{t.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Section wide>
        <SectionHeading eyebrow="What we hold to" title="Five standards, no exceptions." />
        <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {brand.values.map((v, i) => (
            <div key={v.title} className="bg-card p-8">
              <p className="font-display text-2xl font-bold text-ink/25">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 font-display text-lg font-bold text-ink">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="border-t border-border">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
          <img
            src={carpentryAsset.url}
            alt="Hand-cut joinery on custom white oak casework"
            width={1600}
            height={1200}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
          <div>
            <SectionHeading
              eyebrow="Working with us"
              title="One project lead. One phone number. One answer."
              lede="You won't be routed through a call center or handed between managers. The person who walked your site is the person who answers when you call."
            />
            <div className="mt-8">
              <CTAButton to="/contact" variant="primary">
                Request an estimate <ArrowRight className="h-4 w-4" />
              </CTAButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
