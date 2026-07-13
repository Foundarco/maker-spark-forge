import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage } from "@/components/site/FeaturePage";
import { brand } from "@/config/brand";
import { Package, DollarSign, Zap, Recycle, Factory, Truck } from "lucide-react";

export const Route = createFileRoute("/materials/pellets")({
  head: () => ({
    meta: [
      { title: `Pellets — ${brand.name}` },
      { name: "description", content: "Bulk pellet material for the Pellet System. Up to 90% cheaper per kg than spools." },
      { property: "og:title", content: `Pellets — ${brand.name}` },
      { property: "og:description", content: "Bulk material for high-volume printing." },
    ],
  }),
  component: () => (
    <FeaturePage
      eyebrow="Pellets"
      title={<>Print for <span className="text-primary">a fraction</span> of the cost.</>}
      lede="The Pellet System feeds raw thermoplastic pellets straight into a print head. Same quality, drastically lower cost per kilogram, and less waste."
      primaryCta={{ to: "/store", label: "Shop pellets" }}
      secondaryCta={{ to: "/materials/filament", label: "Compare to filament" }}
      features={[
        { icon: DollarSign, title: "Up to 90% cheaper", body: "Bulk pellets cost a fraction of extruded filament — the same polymer, none of the markup." },
        { icon: Zap, title: "High-throughput", body: "Feeds at 2× the volume of typical filament. Ideal for large prints and continuous runs." },
        { icon: Package, title: "5, 10, and 25 kg bags", body: "Buy the size that matches your workflow. Sealed for shelf-stability." },
        { icon: Recycle, title: "Regrind-compatible", body: "Shred failed prints and re-feed them. Closed-loop printing that actually works." },
        { icon: Factory, title: "Industrial polymers", body: "PLA, PETG, ABS, PC, and technical blends. Datasheets on every product page." },
        { icon: Truck, title: "Ships worldwide", body: "Palletized options for schools, labs, and production shops." },
      ]}
      bullets={[
        "Requires the Pellet System upgrade (sold separately)",
        "Compatible with regrind up to 30% by weight",
        "Full material datasheet & MSDS with every order",
        "Bulk pricing tiers at 25kg, 100kg, and 500kg",
      ]}
      finalCta={{
        title: "Cheaper prints, cleaner conscience.",
        to: "/store",
        label: "Shop pellets",
      }}
    />
  ),
});
