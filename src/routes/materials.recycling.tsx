import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage } from "@/components/site/FeaturePage";
import { brand } from "@/config/brand";
import { Recycle, Truck, Gift, Leaf, Factory, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/materials/recycling")({
  head: () => ({
    meta: [
      { title: `Recycling — ${brand.name}` },
      { name: "description", content: "Send us your spools and failed prints. We turn them into new filament." },
      { property: "og:title", content: `Recycling — ${brand.name}` },
      { property: "og:description", content: "Closed-loop 3D printing." },
    ],
  }),
  component: () => (
    <FeaturePage
      eyebrow="Recycling program"
      title={<>Close the <span className="text-primary">loop.</span></>}
      lede="Your failed prints and empty spools shouldn't go in the trash. Send them back, and we turn them back into filament — with credit toward your next order."
      primaryCta={{ to: "/contact", label: "Get a shipping label" }}
      secondaryCta={{ to: "/materials", label: "See all materials" }}
      features={[
        { icon: Truck, title: "Prepaid shipping", body: "Print a label from your account. Ship 2 kg or more, we cover the postage." },
        { icon: Recycle, title: "Sorted & re-pelletized", body: "PLA, PETG, and ABS get separated, shredded, and re-extruded in our partner facility." },
        { icon: Gift, title: "Store credit back", body: "$3/kg store credit on accepted material. Applied automatically at checkout." },
        { icon: Leaf, title: "Transparent chain", body: "Every batch traced. You can see how much material you've kept out of landfill." },
        { icon: Factory, title: "Sold as rPLA", body: "Recycled PLA sold separately at a discount. Same test standards, lower carbon footprint." },
        { icon: RefreshCw, title: "Available at events", body: "Drop off in person at our booth. Instant credit, same day." },
      ]}
      bullets={[
        "Accepts PLA, PETG, ABS, and TPU",
        "Not accepted: painted, glued, or embedded parts",
        "Cardboard spools compostable, don't ship them back",
        "Live carbon-offset counter on your account page",
      ]}
      finalCta={{
        title: "Print, learn, repeat.",
        body: "The most sustainable print is the one that becomes the next print.",
        to: "/contact",
        label: "Start recycling",
      }}
    />
  ),
});
