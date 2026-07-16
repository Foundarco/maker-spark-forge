import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/training")({
  head: () => ({ meta: [{ title: "Training — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Training"
      group="Human Resources"
      description="Training programs and completion tracking."
    />
  ),
});
