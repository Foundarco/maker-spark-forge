import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/csat")({
  head: () => ({ meta: [{ title: "Customer Satisfaction — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Customer Satisfaction"
      group="Customer Service"
      description="CSAT surveys and NPS results."
    />
  ),
});
