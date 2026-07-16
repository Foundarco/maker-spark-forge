import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/marketing-analytics")({
  head: () => ({ meta: [{ title: "Marketing Analytics — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Marketing Analytics"
      group="Marketing"
      description="Campaign performance and attribution."
    />
  ),
});
