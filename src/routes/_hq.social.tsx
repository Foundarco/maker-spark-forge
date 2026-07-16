import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/social")({
  head: () => ({ meta: [{ title: "Social Media — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Social Media"
      group="Marketing"
      description="Cross-platform social scheduling and analytics."
    />
  ),
});
