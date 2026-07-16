import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/packaging")({
  head: () => ({ meta: [{ title: "Packaging — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Packaging"
      group="Manufacturing"
      description="Packing specs, box sizes, and label templates."
    />
  ),
});
