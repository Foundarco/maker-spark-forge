import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productsQuery } from "@/lib/content.queries";
import { Section, PageHeader } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/store")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  head: () => ({
    meta: [
      { title: `Store — ${brand.name}` },
      { name: "description", content: "The Core Printer, materials, upgrades, and replacement parts." },
      { property: "og:title", content: `Store — ${brand.name}` },
      { property: "og:description", content: "The Core Printer, materials, upgrades, and replacement parts." },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  return (
    <>
      <Section>
        <PageHeader eyebrow="Store" title="Everything you need to print, learn, and keep printing." />
        <p className="rounded-2xl border border-dashed border-primary/50 bg-primary-soft/40 p-4 text-sm text-foreground">
          Heads up — checkout is running in preview mode. Orders are saved as expressions of interest until live payments are turned on.
        </p>
      </Section>

      <Section className="py-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.slug} as="article" className="p-0 overflow-hidden">
              <div aria-hidden className="aspect-[4/3] overflow-hidden bg-warm">
                <div className="grid h-full place-items-center text-primary/60 text-sm">
                  <Placeholder>[PLACEHOLDER: {p.name}]</Placeholder>
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.category}</p>
                <h2 className="mt-1 text-xl font-semibold">{p.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.tagline}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm"><Placeholder>{p.price_display}</Placeholder></span>
                  <Link to="/store/$slug" params={{ slug: p.slug }} className="text-sm font-medium text-primary hover:underline">
                    View →
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
