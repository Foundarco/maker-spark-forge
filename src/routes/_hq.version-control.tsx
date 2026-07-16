import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/version-control")({
  head: () => ({ meta: [{ title: "Version Control — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Version Control"
      group="Engineering"
      description="Cross-artifact version tracking (CAD, firmware, PCB)."
    />
  ),
});
