import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { CTAButton } from "@/components/site/CTAButton";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";
import { ArrowRight, Heart, Globe2, GraduationCap, Coffee } from "lucide-react";

const roles = [
  { title: "Senior Mechanical Engineer", team: "Hardware", location: "Remote (Americas)", type: "Full-time" },
  { title: "Firmware Engineer", team: "Software", location: "Remote (worldwide)", type: "Full-time" },
  { title: "Curriculum Designer", team: "Education", location: "Remote (US/EU)", type: "Full-time" },
  { title: "Community Manager", team: "Community", location: "Hybrid — [City]", type: "Full-time" },
  { title: "Customer Support Engineer", team: "Support", location: "Remote (worldwide)", type: "Full-time" },
  { title: "Content Producer", team: "Marketing", location: "Remote (US/EU)", type: "Contract" },
];

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: `Careers — ${brand.name}` },
      { name: "description", content: `Come build the future of approachable 3D printing with ${brand.name}.` },
      { property: "og:title", content: `Careers — ${brand.name}` },
      { property: "og:description", content: "Come build with us." },
    ],
  }),
  component: () => (
    <>
      <Section wide>
        <PageHeader
          eyebrow="Careers"
          title="Come build the tools we wish existed."
          lede="We're a small, remote-friendly team building hardware that teaches. If that sounds like the right room, we'd love to hear from you."
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <CTAButton to="/contact">Send an open application <ArrowRight className="h-4 w-4" /></CTAButton>
          <a href="#open-roles" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold hover:border-foreground/30">
            Jump to open roles
          </a>
        </div>
      </Section>

      <Section wide className="pt-0">
        <Eyebrow>Working here</Eyebrow>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Globe2, title: "Remote-first", body: "Time zones between UTC-8 and UTC+3. Two in-person weeks a year." },
            { icon: Heart, title: "Real health cover", body: "Full medical, dental, vision, and mental-health coverage for you and family." },
            { icon: GraduationCap, title: "Learning budget", body: "$2,000/yr on books, conferences, courses. Actually spend it — we check." },
            { icon: Coffee, title: "Fridays off (paid)", body: "4-day work weeks. Deep work Mon–Thu, breathing room Fridays." },
          ].map((b) => (
            <Card key={b.title}>
              <b.icon className="mb-4 h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section wide id="open-roles">
        <h2 className="mb-8 text-3xl font-semibold sm:text-4xl">Open roles</h2>
        <div className="divide-y divide-border rounded-3xl border border-border bg-card">
          {roles.map((r) => (
            <Link
              key={r.title}
              to="/contact"
              className="group flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition hover:bg-muted"
            >
              <div>
                <p className="text-base font-semibold text-foreground group-hover:text-primary">
                  <Placeholder>{r.title}</Placeholder>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.team} · {r.location} · {r.type}
                </p>
              </div>
              <span className="text-sm font-semibold text-primary">Apply →</span>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Don't see a fit? <Link to="/contact" className="font-semibold text-primary hover:underline">Send us a note anyway</Link>.
        </p>
      </Section>
    </>
  ),
});
