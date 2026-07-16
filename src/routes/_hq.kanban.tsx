import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/kanban")({
  head: () => ({ meta: [{ title: "Kanban Board — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Kanban Board"
      group="Engineering"
      description="Drag-and-drop task workflow visualization."
    />
  ),
});
