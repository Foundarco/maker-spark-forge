import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/factory-live")({
  head: () => ({ meta: [{ title: "Factory Live — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Factory Live"
      group="Future / Wow"
      description="Live 3D dashboard of your factory floor."
    />
  ),
});
