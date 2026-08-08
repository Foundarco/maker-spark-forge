import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HardHat, ShieldCheck, GraduationCap, CalendarClock, Wrench, Truck } from "lucide-react";
import { Section, PageHeader, SectionLabel, DisplayHeading } from "@/components/site/Section";
import { CTAButton } from "@/components/site/CTAButton";
import { Reveal } from "@/components/site/Reveal";
import { brand } from "@/config/brand";
import { divisions } from "@/config/divisions";
import carpentryAsset from "@/assets/mg-carpentry.jpg.asset.json";

const title = `Careers — Join the Crew | ${brand.name}`;
const description =
  "Open trade positions at McGuire Construction: carpenters, concrete finishers, equipment operators, landscape crews, and project managers. Year-round work, in-house crews, real advancement.";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clovrlab.com/careers" },
      { property: "og:image", content: carpentryAsset.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: carpentryAsset.url },
    ],
    links: [{ rel: "canonical", href: "https://clovrlab.com/careers" }],
  }),
  component: CareersPage,
});

const roles = [
  { title: "Lead Carpenter", division: "Construction", type: "Full-time", note: "Framing through finish. Crew of three." },
  { title: "Finish Carpenter", division: "Construction", type: "Full-time", note: "Trim, stairs, and custom millwork install." },
  { title: "Concrete Finisher", division: "Concrete", type: "Full-time", note: "Flatwork, foundations, architectural finishes." },
  { title: "Form Setter", division: "Concrete", type: "Full-time", note: "Footings, walls, and structural pours." },
  { title: "Equipment Operator", division: "Excavation", type: "Full-time", note: "Excavator and skid steer. Grading experience preferred." },
  { title: "Site Foreman", division: "Excavation", type: "Full-time", note: "Utilities, drainage, and final grade." },
  { title: "Hardscape Crew Lead", division: "Landscape", type: "Full-time", note: "Pavers, retaining walls, exterior finishing." },
  { title: "Project Manager", division: "Development", type: "Full-time", note: "Schedule, budget, and client communication." },
];

const benefits = [
  { icon: CalendarClock, title: "Year-round work", body: "Five divisions means the calendar stays full through the off-season — not layoffs in November." },
  { icon: ShieldCheck, title: "Real coverage", body: "Health coverage, paid time off, and a retirement match after ninety days." },
  { icon: GraduationCap, title: "Paid training", body: "Certifications, licenses, and equipment tickets paid for. We'd rather train than rehire." },
  { icon: Wrench, title: "Tools and trucks", body: "Company trucks, maintained equipment, and a tool allowance every year." },
  { icon: Truck, title: "Move between divisions", body: "Cross-train across concrete, excavation, and landscape. Your skills stack, your pay follows." },
  { icon: HardHat, title: "A safe site", body: "Documented safety program, weekly toolbox talks, and no pressure to cut a corner." },
];

function CareersPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-warm">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-25 blur-3xl float-slow"
          style={{ background: "var(--acc-construction)" }}
          aria-hidden
        />
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1.15fr_1fr] lg:items-end">
          <PageHeader
            eyebrow="Careers"
            title={
              <span className="display-cond block text-[clamp(2.5rem,7vw,5rem)]">
                Build with a crew that
                <br />
                <span className="gradient-text">stays together.</span>
              </span>
            }
            lede="McGuire runs its own crews across all five divisions — no rotating subs, no scrambling for winter work. If you take the trade seriously, there's a long career here."
          />
          <img
            src={carpentryAsset.url}
            alt="A McGuire carpenter hand-fitting white oak casework in the millwork shop"
            width={1600}
            height={1200}
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[0_40px_80px_-50px_rgba(0,0,0,0.6)]"
          />
        </div>
      </section>

      <Section wide>
        <Reveal>
          <SectionLabel n="01">Open roles</SectionLabel>
          <DisplayHeading className="mt-6 text-ink">Hiring now</DisplayHeading>
        </Reveal>
        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {roles.map((r, i) => {
            const d = divisions.find((x) => x.short === r.division) ?? divisions[0];
            return (
              <Reveal as="li" key={r.title} delay={i * 50}>
                <Link
                  to="/contact"
                  style={{ ["--accent-color" as string]: d.accent }}
                  className="group flex h-full items-start justify-between gap-6 rounded-2xl bg-card p-7 lift-card accent-ring"
                >
                  <div>
                    <span className="rule-label inline-flex rounded-full accent-wash px-2.5 py-1 accent-ink">
                      {r.division}
                    </span>
                    <h2 className="mt-3 font-display text-xl font-bold text-ink">{r.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.note}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {r.type} · {brand.serviceArea}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 accent-ink transition-transform group-hover:translate-x-1" />
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </Section>

      <section className="border-y border-border bg-warm">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <SectionLabel n="02">Why McGuire</SectionLabel>
            <DisplayHeading className="mt-6 text-ink">What you get</DisplayHeading>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => {
              const accent = divisions[i % divisions.length].accent;
              return (
                <Reveal key={b.title} delay={i * 60}>
                  <div
                    style={{ ["--accent-color" as string]: accent }}
                    className="h-full rounded-2xl bg-card p-8 lift-card accent-ring"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl accent-wash accent-ink">
                      <b.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-bold text-ink">{b.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Section wide>
        <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-16 text-white sm:px-14 sm:py-20">
          <div className="pointer-events-none absolute inset-0 blueprint-grid text-white opacity-60" aria-hidden />
          <div className="relative">
            <SectionLabel tone="light">No open role that fits?</SectionLabel>
            <DisplayHeading className="mt-6 max-w-3xl text-white">
              Send us your name anyway.
            </DisplayHeading>
            <p className="mt-6 max-w-xl text-white/70">
              We hire good people before we need them. Tell us the trade you run, where you&rsquo;ve worked, and how
              soon you&rsquo;re available — someone from the office will call you back.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <CTAButton to="/contact" variant="light" className="rounded-full">
                Apply now <ArrowRight className="h-4 w-4" />
              </CTAButton>
              <a
                href={`tel:${brand.phone.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-white/10"
              >
                Call {brand.phone}
              </a>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
