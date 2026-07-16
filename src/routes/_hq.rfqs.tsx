import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/rfqs")({
  head: () => ({ meta: [{ title: "RFQs — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="RFQs"
      group="Supply Chain"
      description="Request for quote workflow with vendors."
    />
  ),
});
