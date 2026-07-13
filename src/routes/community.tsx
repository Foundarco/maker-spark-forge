import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, PageHeader, Eyebrow } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: `Community — ${brand.name}` },
      { name: "description", content: "Forum, model sharing, ambassador program — everything that makes the community." },
      { property: "og:title", content: `Community — ${brand.name}` },
      { property: "og:description", content: "Forum, model sharing, ambassador program." },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  return (
    <>
      <Section>
        <PageHeader
          eyebrow="Community"
          title="Owners help owners. This is where it happens."
          lede="A place to ask questions, share prints, teach a class, or find one near you."
        />
      </Section>

      <Section className="py-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <Eyebrow>Discussion</Eyebrow>
            <h2 className="mt-2 text-xl font-semibold">Community forum</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ask questions, share fixes, post prints. We're keeping the platform flexible — Discord, Reddit, or an in-house forum — until we settle on one primary home.
            </p>
            <a href={brand.socials.discord} className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
              Open the community <Placeholder>[PLACEHOLDER link]</Placeholder>
            </a>
          </Card>
          <Card>
            <Eyebrow>Sharing</Eyebrow>
            <h2 className="mt-2 text-xl font-semibold">Model library</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Upgrades, spares, and useful prints, all tested on the Core Printer.
            </p>
            <p className="mt-4 text-sm text-primary"><Placeholder>[PLACEHOLDER library link]</Placeholder></p>
          </Card>
          <Card>
            <Eyebrow>Teaching</Eyebrow>
            <h2 className="mt-2 text-xl font-semibold">Ambassador program</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Community members lead classes in their cities. We support with curriculum, materials, and printer loaners.
            </p>
            <Link to="/get-involved" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
              Apply to be an ambassador →
            </Link>
          </Card>
        </div>
      </Section>

      <Section>
        <Eyebrow>Recent activity</Eyebrow>
        <h2 className="text-3xl font-semibold">What people are working on right now.</h2>
        <div className="mt-8 grid gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="flex-row items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-full bg-warm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium"><Placeholder>[user]</Placeholder></span>{" "}
                  <span className="text-muted-foreground"><Placeholder>[posted a fix / shared a print / asked a question]</Placeholder></span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground"><Placeholder>[2h ago]</Placeholder></p>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
