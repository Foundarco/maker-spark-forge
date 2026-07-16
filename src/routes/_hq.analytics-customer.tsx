import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/analytics-customer")({
  head: () => ({ meta: [{ title: "Customer Metrics — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Customer Metrics"
      group="Analytics"
      description="CSAT, NPS, retention, and lifetime value."
    />
  ),
});
