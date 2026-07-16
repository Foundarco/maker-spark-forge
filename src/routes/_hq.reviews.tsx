import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/reviews")({
  head: () => ({ meta: [{ title: "Performance Reviews — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Performance Reviews"
      group="Human Resources"
      description="Performance review cycles and feedback."
    />
  ),
});
