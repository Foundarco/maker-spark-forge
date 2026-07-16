import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/product-features")({
  head: () => ({ meta: [{ title: "Features — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Features"
      group="Product"
      description="Feature backlog and status."
    />
  ),
});
