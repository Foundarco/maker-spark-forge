import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader } from "@/components/site/Section";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: `Terms of Service — ${brand.name}` },
      { name: "description", content: `The terms that apply when you use ${brand.name}'s website and services.` },
      { property: "og:title", content: `Terms of Service — ${brand.name}` },
      { property: "og:description", content: `The terms that apply when you use ${brand.name}.` },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clovrlab.com/legal/terms" },
    ],
    links: [{ rel: "canonical", href: "https://clovrlab.com/legal/terms" }],
  }),
  component: () => (
    <Section>
      <PageHeader eyebrow="Legal" title="Terms of Service" />
      <div className="prose max-w-3xl space-y-5 text-foreground">
        <p><em>Last updated: <Placeholder>[PLACEHOLDER date]</Placeholder></em></p>
        <p>
          By using {brand.name}'s website, store, or community services, you agree to these terms. If you don't agree,
          please don't use the service.
        </p>
        <h2 className="text-xl font-semibold">Use of the site</h2>
        <p>Use it lawfully and don't try to disrupt it. Don't misuse the community or use it to harm others.</p>
        <h2 className="text-xl font-semibold">Orders</h2>
        <p>All orders are subject to availability. Prices are shown at checkout and may change over time.</p>
        <h2 className="text-xl font-semibold">Warranty & liability</h2>
        <p>Our warranty is described on the <a className="text-primary hover:underline" href="/legal/warranty">warranty page</a>. To the extent permitted by law, our liability is limited to the amount you paid for the product.</p>
        <h2 className="text-xl font-semibold">Changes</h2>
        <p>We may update these terms; the "last updated" date will change and continued use means you accept the update.</p>
        <p className="text-muted-foreground"><Placeholder>[PLACEHOLDER: replace with lawyer-reviewed terms specific to jurisdiction, business structure, and dispute resolution before launch.]</Placeholder></p>
      </div>
    </Section>
  ),
});
