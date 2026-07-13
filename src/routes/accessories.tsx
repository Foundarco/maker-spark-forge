import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage } from "@/components/site/FeaturePage";
import { brand } from "@/config/brand";
import { Wrench, Layers3, CircleDot, Grid3x3, Package, Ruler } from "lucide-react";

export const Route = createFileRoute("/accessories")({
  head: () => ({
    meta: [
      { title: `Accessories — ${brand.name}` },
      { name: "description", content: "Build plates, nozzles, tools, and everything you need to keep printing." },
      { property: "og:title", content: `Accessories — ${brand.name}` },
      { property: "og:description", content: "Everything to keep printing." },
    ],
  }),
  component: () => (
    <FeaturePage
      eyebrow="Accessories"
      title={<>The <span className="text-primary">little things</span> that make the print.</>}
      lede="Everyday gear tested by our engineering team. Build plates, nozzles, tools, and the accessories that actually move the needle."
      primaryCta={{ to: "/store", label: "Shop accessories" }}
      secondaryCta={{ to: "/parts", label: "Replacement parts" }}
      features={[
        { icon: Grid3x3, title: "Build plates", body: "PEI, textured, and smooth. Swap in seconds, adhere in a snap." },
        { icon: CircleDot, title: "Nozzles", body: "0.2mm to 0.8mm. Hardened steel for abrasives. Copper for speed." },
        { icon: Wrench, title: "Tool kits", body: "The kit we wish came with every printer. Hex keys, nozzle wrench, scraper." },
        { icon: Layers3, title: "Enclosures", body: "Snap-on panels for ABS and ASA. Ships flat, assembles in 20 min." },
        { icon: Package, title: "Storage", body: "Dry boxes, spool holders, and desiccants for humidity-sensitive materials." },
        { icon: Ruler, title: "Calibration kit", body: "Feeler gauges, dial indicators, and a Z-offset card. Everything to dial it in." },
      ]}
      finalCta={{
        title: "Kit out your printer.",
        body: "Bundles ship free above $100.",
        to: "/store",
        label: "Visit the store",
      }}
    />
  ),
});
