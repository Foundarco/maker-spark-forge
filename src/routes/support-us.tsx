import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/support-us")({
  head: () => ({
    meta: [
      { title: `Support us — ${brand.name}` },
      { name: "description", content: "How to support the work — backing, purchasing, spreading the word." },
      { property: "og:title", content: `Support us — ${brand.name}` },
      { property: "og:description", content: "How to support the work." },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <>
      <Section>
        <PageHeader
          eyebrow="Support us"
          title="A few ways to help what we're building."
          lede="What this page eventually offers depends on decisions we're still finalizing. For now, here's the structure."
        />
      </Section>

      <Section className="py-6">
        <div className="rounded-2xl border border-dashed border-primary/50 bg-primary-soft/40 p-4 text-sm">
          <Placeholder note="Update once business structure and funding model are decided">
            [PLACEHOLDER: revisit this page once the business structure (for-profit / nonprofit) and funding model
            (crowdfunding, backing, donations, other) are locked in. Keep copy generic and non-committal until then.]
          </Placeholder>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card>
            <Eyebrow>Buy something</Eyebrow>
            <h2 className="mt-2 text-xl font-semibold">Buy a printer or a spare</h2>
            <p className="mt-2 text-sm text-muted-foreground">Every unit sold funds curriculum, ambassador loaners, and more open documentation.</p>
          </Card>
          <Card>
            <Eyebrow>Back the work</Eyebrow>
            <h2 className="mt-2 text-xl font-semibold">Back a campaign</h2>
            <p className="mt-2 text-sm text-muted-foreground"><Placeholder>[PLACEHOLDER: link current crowdfunding / backer program, or hide this card, once decided.]</Placeholder></p>
          </Card>
          <Card>
            <Eyebrow>Tell a friend</Eyebrow>
            <h2 className="mt-2 text-xl font-semibold">Spread the word</h2>
            <p className="mt-2 text-sm text-muted-foreground">Send this to a teacher, a librarian, a maker, or anyone who'd get excited.</p>
          </Card>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Reach us at {brand.contact.general} for partnership, sponsorship, or grant conversations.
        </p>
      </Section>
    </>
  );
}
