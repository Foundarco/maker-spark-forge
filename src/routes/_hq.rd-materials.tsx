import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/rd-materials")({
  head: () => ({ meta: [{ title: "Material Database — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Material Database"
      group="R&D"
      description="Material properties and sources."
    />
  ),
});
