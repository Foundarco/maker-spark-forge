import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage } from "@/components/site/FeaturePage";
import { brand } from "@/config/brand";
import { Zap, Eye, Sliders, Layers, GitBranch, Wand2 } from "lucide-react";

export const Route = createFileRoute("/software/slicer")({
  head: () => ({
    meta: [
      { title: `LoomSlicer — ${brand.name}` },
      { name: "description", content: "The free desktop slicer. Fast previews, honest defaults, open source." },
      { property: "og:title", content: `LoomSlicer — ${brand.name}` },
      { property: "og:description", content: "Fast, opinionated slicing for the Core Printer." },
    ],
  }),
  component: () => (
    <FeaturePage
      eyebrow="LoomSlicer 2.0"
      title={<>Slice, preview, print — <span className="text-primary">in seconds.</span></>}
      lede="Rewritten from the ground up. Faster previews, calmer UI, and defaults tuned for our hardware — not guessed at."
      primaryCta={{ to: "/software/downloads", label: "Download for free" }}
      secondaryCta={{ to: "/software", label: "See all software" }}
      features={[
        { icon: Zap, title: "3× faster slicing", body: "Multi-threaded engine. Complex prints slice in seconds, not minutes." },
        { icon: Eye, title: "Live layer preview", body: "Scrub through layers, see moves, spot issues before you press print." },
        { icon: Sliders, title: "Sane defaults", body: "Presets tuned per material by our test lab. Advanced settings never hidden." },
        { icon: Layers, title: "Multi-material ready", body: "Full support for the Pellet System and multi-color workflows." },
        { icon: Wand2, title: "One-click supports", body: "Tree, organic, or classic. Automatic placement you can override anywhere." },
        { icon: GitBranch, title: "Open source", body: "AGPL-3.0. Fork it, patch it, ship your own build." },
      ]}
      bullets={[
        "STL, 3MF, OBJ, STEP import",
        "Custom G-code hooks per layer",
        "Print profiles synced across machines",
        "Post-processing scripts",
        "Object arrangement + auto-orient",
        "Time & material cost estimator",
      ]}
      finalCta={{
        title: "Ready to slice?",
        body: "Free on macOS, Windows, and Linux. No account needed.",
        to: "/software/downloads",
        label: "Download LoomSlicer",
      }}
    />
  ),
});
