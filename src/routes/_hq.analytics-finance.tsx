import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/analytics-finance")({
  head: () => ({ meta: [{ title: "Financial Metrics — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Financial Metrics"
      group="Analytics"
      description="Cash, margin, and runway."
    />
  ),
});
