import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/product-lifecycle")({
  head: () => ({ meta: [{ title: "Product Lifecycle — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Product Lifecycle"
      group="Product"
      description="Which products are active, EOL, or archived."
    />
  ),
});
