import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/shipping-tracking")({
  head: () => ({ meta: [{ title: "Shipping Tracking — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Shipping Tracking"
      group="Supply Chain"
      description="Inbound and outbound shipment tracking."
    />
  ),
});
