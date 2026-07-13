import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader } from "@/components/site/Section";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/legal/shipping-returns")({
  head: () => ({
    meta: [
      { title: `Shipping & Returns — ${brand.name}` },
      { name: "description", content: "How we ship, how long it takes, and how returns work." },
      { property: "og:title", content: `Shipping & Returns — ${brand.name}` },
      { property: "og:description", content: "How we ship and how returns work." },
    ],
  }),
  component: () => (
    <Section>
      <PageHeader eyebrow="Legal" title="Shipping & Returns" />
      <div className="prose max-w-3xl space-y-5 text-foreground">
        <h2 className="text-xl font-semibold">Shipping</h2>
        <ul className="ml-6 list-disc">
          <li>We ship to: <Placeholder>[PLACEHOLDER regions].</Placeholder></li>
          <li>Handling time: <Placeholder>[PLACEHOLDER: e.g. 2 business days].</Placeholder></li>
          <li>Estimated delivery: <Placeholder>[PLACEHOLDER: X–Y business days after handling].</Placeholder></li>
        </ul>
        <h2 className="text-xl font-semibold">Returns</h2>
        <p>You can return an unused, in-original-packaging item within <Placeholder>[PLACEHOLDER days]</Placeholder> of delivery for a refund of the item price. You cover return shipping unless the item arrived damaged or defective.</p>
        <h2 className="text-xl font-semibold">Damaged in transit</h2>
        <p>Email {brand.contact.support} within 7 days of delivery with photos. We'll make it right.</p>
        <h2 className="text-xl font-semibold">Warranty repairs</h2>
        <p>Warranty repairs are handled separately — see the <a className="text-primary hover:underline" href="/legal/warranty">warranty page</a>.</p>
        <p className="text-muted-foreground"><Placeholder>[PLACEHOLDER: finalize specifics with real logistics data before launch.]</Placeholder></p>
      </div>
    </Section>
  ),
});
