import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/product-catalog")({
  head: () => ({ meta: [{ title: "Product Catalog — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Product Catalog"
      group="Product"
      description="Every product SKU and its metadata."
    />
  ),
});
