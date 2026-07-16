import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/sales-analytics")({
  head: () => ({ meta: [{ title: "Sales Analytics — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Sales Analytics"
      group="Sales"
      description="Revenue, conversion, and pipeline analytics."
    />
  ),
});
