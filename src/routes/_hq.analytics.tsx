import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/analytics")({
  head: () => ({ meta: [{ title: "Analytics Dashboards — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Analytics Dashboards"
      group="Analytics"
      description="A gallery of company dashboards."
    />
  ),
});
