import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage } from "@/components/site/FeaturePage";
import { brand } from "@/config/brand";
import { Layers, Smartphone, Cpu, Download, GitBranch, Cloud } from "lucide-react";

export const Route = createFileRoute("/software")({
  head: () => ({
    meta: [
      { title: `Software — ${brand.name}` },
      { name: "description", content: "LoomSlicer, firmware, and mobile app. Open, versioned, free forever." },
      { property: "og:title", content: `Software — ${brand.name}` },
      { property: "og:description", content: "Slicer, firmware, and mobile app — free and open." },
    ],
  }),
  component: () => (
    <FeaturePage
      eyebrow="Software"
      title={<>The stack that <span className="text-primary">runs your printer.</span></>}
      lede="A slicer, firmware, and mobile app — all free, all open, all built to work with the hardware you already own."
      primaryCta={{ to: "/software/downloads", label: "Download everything" }}
      secondaryCta={{ to: "/software/slicer", label: "Meet LoomSlicer" }}
      features={[
        { icon: Layers, title: "LoomSlicer", body: "The desktop slicer we ship the printer with. Fast previews, honest defaults." },
        { icon: Cpu, title: "Open firmware", body: "Full source on GitHub. Signed releases, semantic versioning, real changelogs." },
        { icon: Smartphone, title: "Mobile app", body: "Start, monitor, and get notified about prints from iOS or Android." },
        { icon: Cloud, title: "Cloud sync (opt-in)", body: "Sync profiles across machines. Local-first — cloud never required." },
        { icon: GitBranch, title: "Public roadmap", body: "Every feature request lives in a public tracker. Vote, comment, contribute." },
        { icon: Download, title: "Free forever", body: "No subscription. No premium tier. If it runs on our printer, it's free." },
      ]}
      finalCta={{
        title: "Grab the latest build.",
        body: "macOS, Windows, and Linux. Firmware and slicer profiles included.",
        to: "/software/downloads",
        label: "Go to downloads",
      }}
    />
  ),
});
