import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/work-orders")({
  head: () => ({ meta: [{ title: "Work Orders — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Work Orders"
      group="Manufacturing"
      description="Formal orders to build, repair, or ship."
    />
  ),
});
