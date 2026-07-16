import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/prototypes")({
  head: () => ({ meta: [{ title: "Prototype Tracker — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Prototype Tracker"
      group="Engineering"
      description="Physical prototypes, iterations, and locations."
    />
  ),
});
