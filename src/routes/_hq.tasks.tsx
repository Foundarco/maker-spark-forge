import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Tasks"
      group="Engineering"
      description="Everything on your plate across projects."
    />
  ),
});
