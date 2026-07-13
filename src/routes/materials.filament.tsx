import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage } from "@/components/site/FeaturePage";
import { brand } from "@/config/brand";
import { Palette, TestTube, ShieldCheck, Package, Sparkles, Ruler } from "lucide-react";
import materials from "@/assets/materials.jpg.asset.json";

export const Route = createFileRoute("/materials/filament")({
  head: () => ({
    meta: [
      { title: `Filament — ${brand.name}` },
      { name: "description", content: "PLA, PETG, TPU, ABS, and engineering blends. Tested on the exact machine you own." },
      { property: "og:title", content: `Filament — ${brand.name}` },
      { property: "og:description", content: "Filament tested per profile." },
      { property: "og:image", content: materials.url },
    ],
  }),
  component: () => (
    <FeaturePage
      eyebrow="Filament"
      title={<>Filament that <span className="text-primary">just works.</span></>}
      lede="Every spool tested on our own printers. Every profile ships in LoomSlicer. Every color color-matched to a Pantone reference so re-orders look identical."
      heroImage={materials.url}
      heroImageAlt="Filament spools"
      primaryCta={{ to: "/store", label: "Shop filament" }}
      secondaryCta={{ to: "/materials/pellets", label: "Bulk options" }}
      features={[
        { icon: Palette, title: "40+ colors", body: "Core matte lineup plus seasonal drops. Silks, metallics, and translucents on request." },
        { icon: TestTube, title: "Engineering grades", body: "Carbon-fiber, glass-filled, and flame-retardant blends for functional parts." },
        { icon: Ruler, title: "±0.02mm tolerance", body: "Diameter measured every meter. Documented on the spool label." },
        { icon: ShieldCheck, title: "Batch-traceable", body: "QR on every spool links to its lot number, mfg date, and material datasheet." },
        { icon: Package, title: "Recycled packaging", body: "Cardboard spools, paper stickers, no plastic bags." },
        { icon: Sparkles, title: "Color-matched", body: "Pantone reference on every colored SKU. Re-orders look the same as the last one." },
      ]}
      finalCta={{
        title: "Print in confidence.",
        body: "Free shipping on orders over $75.",
        to: "/store",
        label: "Browse all filament",
      }}
    />
  ),
});
