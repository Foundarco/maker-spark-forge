import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/assembly")({
  head: () => ({ meta: [{ title: "Assembly Instructions — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Assembly Instructions"
      group="Manufacturing"
      description="Step-by-step build guides for the factory floor."
    />
  ),
});
