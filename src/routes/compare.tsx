import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, PageHeader } from "@/components/site/Section";
import { Placeholder } from "@/components/site/Placeholder";
import { brand } from "@/config/brand";
import { Check, X } from "lucide-react";

const models = [
  {
    slug: "core-printer",
    name: "Core Printer",
    price: "$799",
    tagline: "Our flagship. Open frame, direct drive.",
    volume: "256 × 256 × 300 mm",
    speed: "500 mm/s",
    layer: "0.05mm",
    materials: "PLA, PETG, TPU, ABS, PC, CF blends",
    chamber: false,
    ai: "Optional",
    warranty: "1 year",
  },
  {
    slug: "core-printer-plus",
    name: "Core Printer Plus",
    price: "$1,299",
    tagline: "Enclosed. Heated chamber. Bigger.",
    volume: "300 × 300 × 400 mm",
    speed: "500 mm/s",
    layer: "0.04mm",
    materials: "Everything the Core prints + engineering blends",
    chamber: true,
    ai: "Included",
    warranty: "1 year",
  },
  {
    slug: "core-printer-mini",
    name: "Core Printer Mini",
    price: "$399",
    tagline: "Small footprint, full software.",
    volume: "180 × 180 × 180 mm",
    speed: "350 mm/s",
    layer: "0.08mm",
    materials: "PLA, PETG, TPU",
    chamber: false,
    ai: "Optional",
    warranty: "1 year",
  },
];

const rows: Array<{ label: string; key: keyof (typeof models)[number] }> = [
  { label: "Price", key: "price" },
  { label: "Build volume", key: "volume" },
  { label: "Max print speed", key: "speed" },
  { label: "Min layer height", key: "layer" },
  { label: "Materials", key: "materials" },
  { label: "Heated chamber", key: "chamber" },
  { label: "AI camera", key: "ai" },
  { label: "Warranty", key: "warranty" },
];

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: `Compare Printers — ${brand.name}` },
      { name: "description", content: "Side-by-side specs on every printer we make." },
      { property: "og:title", content: `Compare Printers — ${brand.name}` },
      { property: "og:description", content: "Every printer, every spec." },
    ],
  }),
  component: () => (
    <>
      <Section wide>
        <PageHeader
          eyebrow="Compare"
          title="Every printer, every spec."
          lede="No feature lock-in tricks. Everything on this page is real, tested, and repairable."
        />
      </Section>

      <Section wide className="pt-0">
        <div className="overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-6 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Model
                </th>
                {models.map((m) => (
                  <th key={m.slug} className="p-6 text-left">
                    <p className="text-lg font-semibold text-ink">{m.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{m.tagline}</p>
                    <p className="mt-3 text-xl font-bold text-primary">
                      <Placeholder>{m.price}</Placeholder>
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-0">
                  <td className="p-6 font-medium text-muted-foreground">{row.label}</td>
                  {models.map((m) => {
                    const val = m[row.key];
                    return (
                      <td key={m.slug} className="p-6 text-foreground">
                        {typeof val === "boolean" ? (
                          val ? (
                            <Check className="h-5 w-5 text-primary" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground/50" />
                          )
                        ) : (
                          val
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td />
                {models.map((m) => (
                  <td key={m.slug} className="p-6">
                    <Link
                      to="/store/$slug"
                      params={{ slug: m.slug }}
                      className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110"
                    >
                      View →
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </>
  ),
});
