import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage } from "@/components/site/FeaturePage";
import { brand } from "@/config/brand";
import { Zap, Camera, Thermometer, Cpu, Fan, Wifi } from "lucide-react";

export const Route = createFileRoute("/upgrades")({
  head: () => ({
    meta: [
      { title: `Upgrades — ${brand.name}` },
      { name: "description", content: "Extend and improve your printer. Never replace it." },
      { property: "og:title", content: `Upgrades — ${brand.name}` },
      { property: "og:description", content: "Modular upgrades that keep your printer current." },
    ],
  }),
  component: () => (
    <FeaturePage
      eyebrow="Upgrades"
      title={<>Never buy a <span className="text-primary">new printer</span> again.</>}
      lede="We ship upgrades as parts — not as new machines. The printer you buy today keeps getting better."
      primaryCta={{ to: "/store", label: "Shop upgrades" }}
      secondaryCta={{ to: "/how-its-built", label: "See the platform" }}
      features={[
        { icon: Zap, title: "High-flow extruder", body: "Push speeds past 500 mm/s with the CoreFlow hotend upgrade." },
        { icon: Camera, title: "AI camera module", body: "Failure detection, timelapses, and remote monitoring via the mobile app." },
        { icon: Thermometer, title: "Heated chamber", body: "Adds ABS, ASA, and PC to your material list. Retrofits the base printer." },
        { icon: Cpu, title: "Motion board revamp", body: "Faster stepper drivers, smoother acceleration. Same footprint." },
        { icon: Fan, title: "Silent cooling", body: "Direct part-cooling with a 30 dB fan. Print at midnight, sleep through it." },
        { icon: Wifi, title: "Networking module", body: "Wi-Fi 6, ethernet, and Bluetooth in one drop-in board." },
      ]}
      bullets={[
        "Every upgrade is a documented mod with a printable install guide",
        "No warranty voided if you install it yourself",
        "Older upgrades stay in stock — no forced churn",
        "Community-designed mods featured on the /how-its-built page",
      ]}
      finalCta={{
        title: "Your printer, better every quarter.",
        to: "/store",
        label: "Browse upgrades",
      }}
    />
  ),
});
