import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, SectionLabel } from "@/components/site/Section";
import { CTAButtonA } from "@/components/site/CTAButton";
import { brand } from "@/config/brand";
import { SITE_URL } from "@/lib/seo";
import deliverImg from "@/assets/cr-deliver.jpg";

const desc =
  "Volunteer with Clovr Relief — field response rosters, logistics and warehouse shifts, medical credentials, and remote operations support.";
const title = `Volunteer — ${brand.name}`;

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/volunteer` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/volunteer` }],
  }),
  component: VolunteerPage,
});

const roles = [
  {
    name: "Field response roster",
    commitment: "6-hour recall · 7–14 day deployments",
    body: "Deployable responders for distribution, shelter setup, and site logistics. Requires background check and readiness training.",
  },
  {
    name: "Logistics & cache shifts",
    commitment: "Local · monthly",
    body: "Pack, rotate, and audit pre-positioned supply at a regional cache. No experience needed; training provided.",
  },
  {
    name: "Clinical volunteers",
    commitment: "Credentialed · on call",
    body: "Physicians, nurses, paramedics, and pharmacists who can support mobile clinics and field medical resupply.",
  },
  {
    name: "Remote operations support",
    commitment: "Remote · flexible",
    body: "Mapping, translation, case-file intake, and data QA during an active response. Fully remote shifts.",
  },
];

function VolunteerPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <img
          src={deliverImg}
          alt="Aid volunteers carrying supply crates through a flooded village road at sunset"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[var(--night)]/85" aria-hidden />
        <div className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
          <PageHeader
            eyebrow="Volunteer"
            title="Trained before the call comes."
            lede="Volunteers here are rostered, credentialed, and rehearsed — so nobody arrives at a disaster site improvising."
          />
        </div>
      </section>

      <Section wide>
        <SectionLabel n="01" tone="light">Open roles</SectionLabel>
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {roles.map((r) => (
            <li key={r.name} className="grid gap-3 py-7 md:grid-cols-[1fr_1.4fr] md:gap-10">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">{r.name}</h2>
                <p className="rule-label mt-2 text-primary">{r.commitment}</p>
              </div>
              <p className="leading-relaxed text-muted-foreground">{r.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <CTAButtonA
            variant="primary"
            href={`mailto:${brand.contact.general}?subject=${encodeURIComponent("Volunteer application")}`}
          >
            Apply to volunteer
          </CTAButtonA>
        </div>
      </Section>

      <div className="border-t border-border bg-[var(--night)]">
        <Section wide>
          <SectionLabel n="02" tone="light">What to expect</SectionLabel>
          <div className="mt-10 grid gap-px bg-border md:grid-cols-3">
            {[
              { t: "Screening", b: "Background check, references, and a short readiness interview." },
              { t: "Training", b: "Safety, incident command basics, and role-specific drills before any deployment." },
              { t: "Activation", b: "You are placed on a roster and called only when your role and region match." },
            ].map((s) => (
              <article key={s.t} className="bg-[var(--night)] p-7">
                <h3 className="font-display text-lg font-bold text-ink">{s.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.b}</p>
              </article>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
