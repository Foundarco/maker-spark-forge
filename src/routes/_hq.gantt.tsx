import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/gantt")({
  head: () => ({ meta: [{ title: "Gantt Charts — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Gantt Charts"
      group="Engineering"
      description="Timeline view of project dependencies."
    />
  ),
});
