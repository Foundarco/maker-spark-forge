import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/vendor-quotes")({
  head: () => ({ meta: [{ title: "Vendor Quotes — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Vendor Quotes"
      group="Supply Chain"
      description="Received quotes from vendors."
    />
  ),
});
