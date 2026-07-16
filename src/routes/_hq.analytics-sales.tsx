import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/analytics-sales")({
  head: () => ({ meta: [{ title: "Sales Metrics — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Sales Metrics"
      group="Analytics"
      description="Revenue, conversion, and cohort analysis."
    />
  ),
});
