import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { guidesQuery } from "@/lib/content.queries";
import { brand } from "@/config/brand";
import { Search } from "lucide-react";

export const Route = createFileRoute("/help")({
  loader: ({ context }) => context.queryClient.ensureQueryData(guidesQuery),
  head: () => ({
    meta: [
      { title: `Homeowner Help & Warranty Support | ${brand.name}` },
      { name: "description", content: "Warranty claims, punch-list requests, seasonal home maintenance guides, and how to reach the McGuire office after your project is finished." },
      { property: "og:title", content: `Homeowner Help & Warranty Support | ${brand.name}` },
      { property: "og:description", content: "Warranty claims, punch lists, and maintenance guidance for McGuire clients." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clovrlab.com/help" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://clovrlab.com/help" }],
  }),
  component: HelpPage,
});

function HelpPage() {
  const { data: guides } = useSuspenseQuery(guidesQuery);
  const [q, setQ] = useState("");
  const filtered = guides.filter((g) => {
    const s = q.toLowerCase();
    if (!s) return true;
    return `${g.title} ${g.symptom ?? ""} ${g.category ?? ""}`.toLowerCase().includes(s);
  });
  const byCategory = filtered.reduce<Record<string, typeof filtered>>((acc, g) => {
    const key = g.category ?? "Other";
    (acc[key] ??= []).push(g);
    return acc;
  }, {});

  return (
    <>
      <Section>
        <PageHeader
          eyebrow="Help & repair"
          title="What's going wrong? Let's find the fix."
          lede="Symptom-first repair guides. Start with what you're seeing, end with the working machine."
        />
        <label className="relative block max-w-xl">
          <span className="sr-only">Search guides</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Describe what's wrong (e.g. 'first layer', 'clicking')"
            className="h-14 w-full rounded-full border border-border bg-card pl-12 pr-5 text-base outline-none focus:border-primary"
          />
        </label>
      </Section>

      <Section className="py-6">
        <div className="space-y-12">
          {Object.entries(byCategory).map(([cat, list]) => (
            <div key={cat}>
              <Eyebrow>{cat}</Eyebrow>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {list.map((g) => (
                  <Card key={g.slug} as="article">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">{g.difficulty}</p>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">
                      <Link to="/help/$slug" params={{ slug: g.slug }} className="hover:underline">{g.title}</Link>
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{g.symptom}</p>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground">Nothing matched. Try a different symptom, or <Link to="/contact" className="text-primary hover:underline">contact support</Link>.</p>
          )}
        </div>
      </Section>

      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <Eyebrow>Still stuck?</Eyebrow>
            <h2 className="mt-2 text-2xl font-semibold">Contact support</h2>
            <p className="mt-2 text-sm text-muted-foreground">A person will get back to you.</p>
            <Link to="/contact" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">Open support form →</Link>
          </Card>
          <Card>
            <Eyebrow>Warranty</Eyebrow>
            <h2 className="mt-2 text-2xl font-semibold">1 year, full coverage</h2>
            <p className="mt-2 text-sm text-muted-foreground">The short version. Full policy on the warranty page.</p>
            <Link to="/legal/warranty" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">Read the warranty →</Link>
          </Card>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">Not seeing what you need? Email {brand.contact.support}.</p>
      </Section>
    </>
  );
}
