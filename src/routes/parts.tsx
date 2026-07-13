import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage } from "@/components/site/FeaturePage";
import { brand } from "@/config/brand";
import { Wrench, Download, ShieldCheck, Package, RefreshCw, Users } from "lucide-react";

export const Route = createFileRoute("/parts")({
  head: () => ({
    meta: [
      { title: `Replacement Parts — ${brand.name}` },
      { name: "description", content: "Every screw, every belt. If it breaks, you can replace it." },
      { property: "og:title", content: `Replacement Parts — ${brand.name}` },
      { property: "og:description", content: "Every part, printable or purchasable." },
    ],
  }),
  component: () => (
    <FeaturePage
      eyebrow="Replacement parts"
      title={<>Every part, <span className="text-primary">printable or purchasable.</span></>}
      lede="Standard fasteners. Documented BOM. Printable STLs for community-made spares. If something breaks, you're back up in a day."
      primaryCta={{ to: "/store", label: "Shop parts" }}
      secondaryCta={{ to: "/help", label: "Repair guides" }}
      features={[
        { icon: Wrench, title: "Standard hardware", body: "M3 and M5 screws, DIN-standard bearings. No proprietary fasteners." },
        { icon: Download, title: "Free STLs", body: "Every non-load-bearing part downloadable. Print your own spare, keep the original." },
        { icon: Package, title: "Kits pre-assembled", body: "Buy a full hotend, a full motion axis, a full electronics bay. Swap in minutes." },
        { icon: ShieldCheck, title: "Genuine parts guaranteed", body: "Every part carries a QR to verify authenticity and view its manufacture date." },
        { icon: RefreshCw, title: "Long-life inventory", body: "We stock parts for at least 7 years after a printer's launch. Documented commitment." },
        { icon: Users, title: "Community spares", body: "Verified community makers sell approved spares. Directory on the community page." },
      ]}
      finalCta={{
        title: "Broke something?",
        body: "Nothing about your printer is intentionally disposable.",
        to: "/help",
        label: "Find the repair guide",
      }}
    />
  ),
});
