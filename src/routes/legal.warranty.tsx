import { createFileRoute } from "@tanstack/react-router";
import { Section, PageHeader } from "@/components/site/Section";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";

export const Route = createFileRoute("/legal/warranty")({
  head: () => ({
    meta: [
      { title: `Warranty — ${brand.name}` },
      { name: "description", content: "One year, full coverage. No per-part carve-outs." },
      { property: "og:title", content: `Warranty — ${brand.name}` },
      { property: "og:description", content: "One year, full coverage." },
    ],
  }),
  component: () => (
    <Section>
      <PageHeader
        eyebrow="Legal"
        title="Warranty"
        lede="One year of coverage on the printer, all major sub-assemblies, and included accessories."
      />
      <div className="prose max-w-3xl space-y-5 text-foreground">
        <p><Placeholder note="Confirm final wording before publishing">[PLACEHOLDER: confirm final warranty wording, including jurisdictional carve-outs required by law.]</Placeholder></p>
        <h2 className="text-xl font-semibold">What's covered</h2>
        <ul className="ml-6 list-disc">
          <li>Defects in materials or workmanship on the printer and included accessories.</li>
          <li>All major sub-assemblies (frame, motion system, electronics, hotend, heated bed).</li>
          <li>No per-part carve-outs.</li>
        </ul>
        <h2 className="text-xl font-semibold">What's not covered</h2>
        <ul className="ml-6 list-disc">
          <li>Consumables (nozzles, PTFE tubes, adhesion aids).</li>
          <li>Damage from accidents, mods that void the warranty (documented separately), or misuse.</li>
        </ul>
        <h2 className="text-xl font-semibold">How to make a claim</h2>
        <p>Email {brand.contact.support} with your order number and a short description. We usually respond within one business day.</p>
        <h2 className="text-xl font-semibold">Repair philosophy</h2>
        <p>Even after warranty, we sell replacement parts and publish printable STLs for community-produced spares. Nothing about your printer is intentionally disposable.</p>
      </div>
    </Section>
  ),
});
