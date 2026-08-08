import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader } from "@/components/site/Section";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${brand.name}` },
      { name: "description", content: `How ${brand.name} collects, uses, and protects personal information.` },
      { property: "og:title", content: `Privacy Policy — ${brand.name}` },
      { property: "og:description", content: `How ${brand.name} collects, uses, and protects personal information.` },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clovrlab.com/legal/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://clovrlab.com/legal/privacy" }],
  }),
  component: () => (
    <Section>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <div className="prose max-w-3xl space-y-5 text-foreground">
        <p><em>Last updated: <Placeholder>[PLACEHOLDER date]</Placeholder></em></p>
        <p>
          {brand.name} respects your privacy. This policy explains what information we collect when you use our
          website and services, why we collect it, and what your choices are.
        </p>
        <h2 className="text-xl font-semibold">What we collect</h2>
        <ul className="ml-6 list-disc">
          <li>Information you give us directly (name, email, shipping address, order details).</li>
          <li>Basic technical information (browser type, IP, pages visited) collected via standard web analytics.</li>
          <li>Support and community messages you send us.</li>
        </ul>
        <h2 className="text-xl font-semibold">How we use it</h2>
        <p>To fulfill orders, respond to support, send you updates you've opted into, and improve the site.</p>
        <h2 className="text-xl font-semibold">Sharing</h2>
        <p>We don't sell your personal information. We share it only with service providers we need to run the business (payments, shipping, email), under contract.</p>
        <h2 className="text-xl font-semibold">Your choices</h2>
        <p>You can request a copy or deletion of your data at any time by emailing {brand.contact.general}.</p>
        <p className="text-muted-foreground"><Placeholder>[PLACEHOLDER: replace with a lawyer-reviewed policy before launch — include jurisdiction, retention, GDPR/CCPA language as applicable.]</Placeholder></p>
      </div>
    </Section>
  ),
});
