import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/pricing-admin")({
  head: () => ({ meta: [{ title: "Pricing — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Pricing"
      group="Sales"
      description="Internal product pricing rules and history."
    />
  ),
});
