import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/product-docs")({
  head: () => ({ meta: [{ title: "Product Docs — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Product Docs"
      group="Product"
      description="End-user product documentation."
    />
  ),
});
