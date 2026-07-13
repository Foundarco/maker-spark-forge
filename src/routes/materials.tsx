import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage } from "@/components/site/FeaturePage";
import { brand } from "@/config/brand";
import { Layers, Recycle, Sparkles, Package, TestTube, Leaf } from "lucide-react";
import materials from "@/assets/materials.jpg.asset.json";

export const Route = createFileRoute("/materials")({
  head: () => ({
    meta: [
      { title: `Materials — ${brand.name}` },
      { name: "description", content: "Filament, pellets, and a recycling program. Print with materials you can trust." },
      { property: "og:title", content: `Materials — ${brand.name}` },
      { property: "og:description", content: "Filament, pellets, and recycling." },
      { property: "og:image", content: materials.url },
    ],
  }),
  component: () => (
    <FeaturePage
      eyebrow="Materials"
      title={<>Materials <span className="text-primary">worth printing with.</span></>}
      lede="Filament tested on the exact machine you own. Bulk pellets for high-volume work. And a recycling loop so your prints don't end up in landfill."
      heroImage={materials.url}
      heroImageAlt="Colorful stack of filament spools"
      primaryCta={{ to: "/materials/filament", label: "Shop filament" }}
      secondaryCta={{ to: "/materials/pellets", label: "See pellets" }}
      features={[
        { icon: Layers, title: "PLA, PETG, TPU, ABS", body: "Core lineup, dialed in per profile. Presets ship with LoomSlicer." },
        { icon: TestTube, title: "Engineering blends", body: "Carbon-fiber PA, glass-filled PC, and PPA-CF for functional prints." },
        { icon: Package, title: "Bulk pellets", body: "For the Pellet System. Up to 90% cheaper per kg than spools." },
        { icon: Recycle, title: "Take-back program", body: "Send us your spools and failed prints. We reprocess them into new filament." },
        { icon: Sparkles, title: "Silks & metallics", body: "Show-off finishes for gifts and portfolio pieces. Colorfast, non-toxic." },
        { icon: Leaf, title: "Bio-based options", body: "PLA from renewable feedstocks. Certified compostable in industrial facilities." },
      ]}
      finalCta={{
        title: "Print with materials you can trust.",
        to: "/store",
        label: "Browse the catalog",
      }}
    />
  ),
});
