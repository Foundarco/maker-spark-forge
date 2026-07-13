import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage } from "@/components/site/FeaturePage";
import { brand } from "@/config/brand";
import { GitBranch, ShieldCheck, FileText, Terminal, Rewind, Users } from "lucide-react";

export const Route = createFileRoute("/software/firmware")({
  head: () => ({
    meta: [
      { title: `Firmware — ${brand.name}` },
      { name: "description", content: "Open firmware. Signed releases. Real changelogs. Roll back anytime." },
      { property: "og:title", content: `Firmware — ${brand.name}` },
      { property: "og:description", content: "Open, versioned firmware you actually own." },
    ],
  }),
  component: () => (
    <FeaturePage
      eyebrow="Firmware"
      title={<>Firmware you <span className="text-primary">actually own.</span></>}
      lede="No forced updates. No black boxes. Signed builds, full source on GitHub, and the ability to roll back to any previous version."
      primaryCta={{ to: "/software/downloads", label: "Latest firmware" }}
      secondaryCta={{ to: "https://github.com", label: "View source" }}
      features={[
        { icon: GitBranch, title: "Full source, always", body: "GPL-3.0. Every commit, every branch, every release tag lives on GitHub." },
        { icon: ShieldCheck, title: "Signed releases", body: "Every build cryptographically signed. Your printer verifies before flashing." },
        { icon: FileText, title: "Real changelogs", body: "Every version notes what changed, why, and which known issues remain." },
        { icon: Rewind, title: "Roll back anytime", body: "Don't like a change? Downgrade from the printer's touch screen in 30 seconds." },
        { icon: Terminal, title: "Serial + SSH access", body: "Debug ports aren't disabled. Print logs, hook into events, script anything." },
        { icon: Users, title: "Community forks welcome", body: "Custom slicer output? Wild post-processing? Fork away. We link the good ones." },
      ]}
      finalCta={{
        title: "Contribute upstream.",
        body: "Pull requests welcome. First-time contributors get a printed 'thanks' from us.",
        to: "/community",
        label: "Join the community",
      }}
    />
  ),
});
