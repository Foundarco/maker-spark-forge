import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/purchase-history")({
  head: () => ({ meta: [{ title: "Purchase History — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Purchase History"
      group="Supply Chain"
      description="History of every purchase by part and supplier."
    />
  ),
});
