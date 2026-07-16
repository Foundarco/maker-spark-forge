import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/production")({
  head: () => ({ meta: [{ title: "Production Queue — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Production Queue"
      group="Manufacturing"
      description="What is being built right now, and next."
    />
  ),
});
