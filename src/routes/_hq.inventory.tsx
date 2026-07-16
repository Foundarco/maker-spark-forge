import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Inventory"
      group="Manufacturing"
      description="Real-time stock levels across warehouses and bins."
    />
  ),
});
