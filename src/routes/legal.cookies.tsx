import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader } from "@/components/site/Section";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/legal/cookies")({
  head: () => ({
    meta: [
      { title: `Cookie Policy — ${brand.name}` },
      { name: "description", content: "What cookies and similar technologies we use, and why." },
      { property: "og:title", content: `Cookie Policy — ${brand.name}` },
      { property: "og:description", content: "Cookies and similar technologies." },
    ],
  }),
  component: () => (
    <Section>
      <PageHeader eyebrow="Legal" title="Cookie Policy" />
      <div className="prose max-w-3xl space-y-5 text-foreground">
        <p>We use a small number of cookies and similar technologies to keep the site working and to understand how it's used.</p>
        <h2 className="text-xl font-semibold">Categories</h2>
        <ul className="ml-6 list-disc">
          <li><strong>Strictly necessary</strong> — for cart state, session handling, and security.</li>
          <li><strong>Analytics</strong> — <Placeholder>[PLACEHOLDER: name the tool, e.g. Plausible / Fathom / GA4]</Placeholder>, aggregated and anonymized.</li>
        </ul>
        <h2 className="text-xl font-semibold">Your choices</h2>
        <p>You can clear cookies from your browser at any time. Analytics can be opted out of via <Placeholder>[PLACEHOLDER: DNT / consent banner / opt-out link].</Placeholder></p>
        <p className="text-muted-foreground"><Placeholder>[PLACEHOLDER: confirm final analytics stack and adjust this page.]</Placeholder></p>
        <p>Contact: {brand.contact.general}</p>
      </div>
    </Section>
  ),
});
