import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/product-releases")({
  head: () => ({ meta: [{ title: "Release Planning — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Release Planning"
      group="Product"
      description="Upcoming releases and their scope."
    />
  ),
});
