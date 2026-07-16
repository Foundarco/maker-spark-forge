import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/discounts")({
  head: () => ({ meta: [{ title: "Discounts — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Discounts"
      group="Sales"
      description="Discount codes and volume pricing rules."
    />
  ),
});
