import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/purchase-orders")({
  head: () => ({ meta: [{ title: "Purchase Orders — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Purchase Orders"
      group="Manufacturing"
      description="Outgoing purchase orders to suppliers."
    />
  ),
});
