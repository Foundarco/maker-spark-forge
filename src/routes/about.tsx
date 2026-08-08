import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionHeading, SectionLabel, DisplayHeading } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { Reveal } from "@/components/site/Reveal";
import { brand } from "@/config/brand";
import { divisions } from "@/config/divisions";
import { ArrowRight, Phone, Mail } from "lucide-react";
import carpentryAsset from "@/assets/mg-carpentry.jpg.asset.json";
import remodelAsset from "@/assets/mg-remodel.jpg.asset.json";
import founderAsset from "@/assets/mg-founder.jpg.asset.json";
import presidentAsset from "@/assets/mg-president.jpg.asset.json";

const title = `About & Leadership — ${brand.name}`;
const desc = `Meet the family behind McGuire Construction: founder Michael McGuire, who started the company in ${brand.established}, and Ryan McGuire, who runs it today.`;

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clovrlab.com/about" },
      { property: "og:image", content: founderAsset.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: founderAsset.url },
    ],
    links: [{ rel: "canonical", href: "https://clovrlab.com/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "GeneralContractor",
          name: brand.name,
          url: "https://clovrlab.com",
          telephone: brand.phone,
          email: brand.contact.general,
          foundingDate: String(brand.established),
          founder: { "@type": "Person", name: "Michael McGuire" },
          areaServed: brand.serviceArea,
          slogan: brand.tagline,
          employee: [{ "@type": "Person", name: "Ryan McGuire", jobTitle: "President" }],
        }),
      },
    ],
  }),
  component: AboutPage,
});

const leaders = [
  {
    name: "Michael McGuire",
    role: "Founder",
    years: `1974 – 2018 · Chairman today`,
    image: founderAsset.url,
    alt: "Michael McGuire, founder of McGuire Construction, standing in a lumber yard at golden hour",
    bio: "Michael started McGuire Construction in 1974 with a pickup, a framing crew of one, and a rule he never broke: finish the job the way you told the homeowner you would. He spent forty years on the tools before handing over day-to-day operations — and he still walks the framing on every custom home.",
    quote: "You don't get a second reputation. Build it right the first time.",
  },
  {
    name: "Ryan McGuire",
    role: "President",
    years: "2018 – present · Second generation",
    image: presidentAsset.url,
    alt: "Ryan McGuire, president of McGuire Construction, holding blueprints on a residential job site",
    bio: "Ryan grew up on his father's job sites and came back with a construction management degree and a plan: take every stage of the build in-house. Under him, McGuire went from one crew to five divisions — concrete, excavation, landscape, and development — with published schedules and estimates clients can actually read.",
    quote: "Every division we open removes one more handoff someone else could drop.",
  },
];

const timeline = [
  { year: "1974", body: "Michael McGuire starts framing houses out of a single truck, taking work by referral only." },
  { year: "1988", body: "First full crew hired. The company moves into additions and structural remodels." },
  { year: "2004", body: "A dedicated millwork shop opens, bringing cabinetry and trim work in-house." },
  { year: "2018", body: "Ryan McGuire takes over as president and formalizes scheduling and estimating systems." },
  { year: "2022", body: "Concrete and excavation come in-house — the first two divisions of the McGuire Group." },
  { year: "Today", body: "Five divisions, in-house crews across every trade, and a project system clients can see into." },
];

function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-warm">
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <PageHeader
            eyebrow={`Family-run since ${brand.established}`}
            title={
              <span className="display-cond block text-[clamp(2.5rem,7vw,5rem)]">
                Two generations.
                <br />
                <span className="gradient-text">One standard.</span>
              </span>
            }
            lede="McGuire Construction started with one truck and a reputation for finishing what was promised. Thirty years later the crews are bigger, the divisions are five deep, and the standard hasn't moved an inch."
          />
          <img
            src={remodelAsset.url}
            alt="A completed McGuire interior renovation with oak flooring and exposed beams"
            width={1600}
            height={1200}
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[0_40px_80px_-50px_rgba(0,0,0,0.6)]"
          />
        </div>
      </section>

      {/* ── LEADERSHIP ─────────────────────────────────── */}
      <Section wide>
        <Reveal>
          <SectionLabel n="01">Leadership</SectionLabel>
          <DisplayHeading className="mt-6 text-ink">The people accountable</DisplayHeading>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            No holding company, no absentee owner. Two McGuires sign off on the work, and both of their phone
            numbers are in your project file.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {leaders.map((l, i) => (
            <Reveal key={l.name} delay={i * 90}>
              <article
                style={{ ["--accent-color" as string]: divisions[i].accent }}
                className="flex h-full flex-col overflow-hidden rounded-3xl bg-card lift-card accent-ring"
              >
                <div className="relative">
                  <img
                    src={l.image}
                    alt={l.alt}
                    width={1024}
                    height={1280}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover object-top"
                  />
                  <span className="absolute left-5 top-5 rule-label rounded-full accent-bg px-3 py-1.5 text-white">
                    {l.role}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="display-cond text-[clamp(1.75rem,3vw,2.5rem)] text-ink">{l.name}</h3>
                  <p className="rule-label mt-2 accent-ink">{l.years}</p>
                  <p className="mt-5 flex-1 text-base leading-relaxed text-muted-foreground">{l.bio}</p>
                  <blockquote className="mt-6 border-l-2 pl-5 text-lg italic leading-relaxed text-ink" style={{ borderColor: divisions[i].accent }}>
                    &ldquo;{l.quote}&rdquo;
                  </blockquote>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl bg-warm p-6">
            <p className="text-sm font-semibold text-ink">Talk to the office directly:</p>
            <a
              href={`tel:${brand.phone.replace(/[^0-9+]/g, "")}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-ink"
            >
              <Phone className="h-4 w-4" aria-hidden /> {brand.phone}
            </a>
            <a
              href={`mailto:${brand.contact.general}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-ink"
            >
              <Mail className="h-4 w-4" aria-hidden /> {brand.contact.general}
            </a>
          </div>
        </Reveal>
      </Section>

      {/* ── STORY ──────────────────────────────────────── */}
      <section className="border-y border-border bg-warm">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <SectionHeading eyebrow="Our story" title="Built on referrals, not advertising." />
          </Reveal>
          <Reveal delay={80}>
            <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>
                The company began in {brand.established} with residential framing. There was no marketing budget and
                no sales team — the only way to get the next job was to finish the last one properly and let the
                homeowner tell a neighbor.
              </p>
              <p>
                That constraint shaped everything. We priced honestly because we&rsquo;d see those clients again. We
                cleaned the site because the neighbors were watching. We wrote things down because memory isn&rsquo;t a
                contract. Nearly three quarters of the work we take on today still comes from a past client or a
                referral from one.
              </p>
              <p>
                The second generation runs day-to-day operations now. What changed is the infrastructure —
                scheduling, estimating, and five self-performing divisions instead of a notebook in a truck. What
                didn&rsquo;t change is who is responsible when something isn&rsquo;t right.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TIMELINE ───────────────────────────────────── */}
      <Section wide>
        <Reveal>
          <SectionLabel n="02">Timeline</SectionLabel>
          <DisplayHeading className="mt-6 text-ink">Thirty years, in order.</DisplayHeading>
        </Reveal>
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {timeline.map((t, i) => (
            <Reveal as="li" key={t.year} delay={i * 60}>
              <div
                style={{ ["--accent-color" as string]: divisions[i % divisions.length].accent }}
                className="h-full rounded-2xl bg-card p-7 lift-card accent-ring"
              >
                <p className="display-cond text-3xl accent-ink">{t.year}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* ── VALUES ─────────────────────────────────────── */}
      <section className="border-y border-border bg-warm">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <SectionLabel n="03">What we hold to</SectionLabel>
            <DisplayHeading className="mt-6 text-ink">Five standards, no exceptions.</DisplayHeading>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brand.values.map((v, i) => (
              <Reveal key={v.title} delay={i * 60}>
                <div
                  style={{ ["--accent-color" as string]: divisions[i % divisions.length].accent }}
                  className="h-full rounded-2xl bg-card p-8 lift-card accent-ring"
                >
                  <p className="display-cond text-2xl accent-ink">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Section wide>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <img
            src={carpentryAsset.url}
            alt="Hand-cut joinery on custom white oak casework in the McGuire millwork shop"
            width={1600}
            height={1200}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
          <div>
            <SectionHeading
              eyebrow="Working with us"
              title="One project lead. One phone number. One answer."
              lede="You won't be routed through a call center or handed between managers. The person who walked your site is the person who answers when you call."
            />
            <div className="mt-8">
              <CTAButton to="/contact" variant="primary" className="rounded-full">
                Request an estimate <ArrowRight className="h-4 w-4" />
              </CTAButton>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
