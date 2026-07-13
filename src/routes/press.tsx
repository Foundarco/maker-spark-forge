import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";
import { Download, ExternalLink, Mail } from "lucide-react";

const coverage = [
  { outlet: "Make: Magazine", title: "Why this open-frame printer is the one to teach on", date: "May 2026" },
  { outlet: "Hackaday", title: "A printer designed to be repaired — imagine that", date: "April 2026" },
  { outlet: "The Verge", title: "3D printing's answer to right-to-repair", date: "March 2026" },
  { outlet: "EdSurge", title: "The classroom printer teachers actually want", date: "February 2026" },
];

export const Route = createFileRoute("/press")({
  head: () => ({
    meta: [
      { title: `Press — ${brand.name}` },
      { name: "description", content: `Media kit, press releases, and coverage of ${brand.name}.` },
      { property: "og:title", content: `Press — ${brand.name}` },
      { property: "og:description", content: "Press & media kit." },
    ],
  }),
  component: () => (
    <>
      <Section wide>
        <PageHeader
          eyebrow="Press"
          title="Media kit, press releases, and coverage."
          lede="Everything a journalist, blogger, or editor might need. If you can't find something, email us — we usually reply the same day."
        />
      </Section>

      <Section wide className="pt-0">
        <div className="grid gap-5 lg:grid-cols-3">
          <Card>
            <Download className="mb-4 h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Media kit</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Logos, product photography, founder headshots, and brand guidelines. ZIP, ~120 MB.
            </p>
            <a href="#" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Download kit →
            </a>
          </Card>
          <Card>
            <ExternalLink className="mb-4 h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Press releases</h2>
            <p className="mt-2 text-sm text-muted-foreground">Announcements, product launches, and milestones.</p>
            <a href="#" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              View archive →
            </a>
          </Card>
          <Card>
            <Mail className="mb-4 h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Press contact</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              For interviews, review units, and quotes.
            </p>
            <a href={`mailto:${brand.contact.press}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              {brand.contact.press} →
            </a>
          </Card>
        </div>
      </Section>

      <Section wide>
        <Eyebrow>Selected coverage</Eyebrow>
        <div className="mt-8 divide-y divide-border rounded-3xl border border-border bg-card">
          {coverage.map((c) => (
            <a
              key={c.title}
              href="#"
              className="group flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition hover:bg-muted"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary"><Placeholder>{c.outlet}</Placeholder></p>
                <p className="mt-1 text-base font-semibold text-foreground group-hover:text-primary">
                  <Placeholder>{c.title}</Placeholder>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{c.date}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </a>
          ))}
        </div>
      </Section>

      <Section wide>
        <Eyebrow>Boilerplate</Eyebrow>
        <div className="mt-6 rounded-3xl border border-border bg-card p-8 text-sm leading-relaxed text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">{brand.name}</span> builds community-first 3D printers designed to teach. Founded in <Placeholder>[YEAR]</Placeholder>, {brand.name} makes hardware that's visible, repairable, and educational — with a mission to expand youth access to STEM. The company is headquartered in <Placeholder>[CITY]</Placeholder>.
          </p>
        </div>
      </Section>
    </>
  ),
});
