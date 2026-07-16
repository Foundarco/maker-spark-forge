import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/warehouse")({
  head: () => ({ meta: [{ title: "Warehouse — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Warehouse"
      group="Manufacturing"
      description="Warehouse locations, bins, and movement."
    />
  ),
});
