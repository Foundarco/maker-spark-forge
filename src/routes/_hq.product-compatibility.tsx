import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/product-compatibility")({
  head: () => ({ meta: [{ title: "Compatibility — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Compatibility"
      group="Product"
      description="What works with what — the compatibility matrix."
    />
  ),
});
