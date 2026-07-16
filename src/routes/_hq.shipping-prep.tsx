import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/shipping-prep")({
  head: () => ({ meta: [{ title: "Shipping Prep — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Shipping Prep"
      group="Manufacturing"
      description="Prepare orders for outbound shipment."
    />
  ),
});
