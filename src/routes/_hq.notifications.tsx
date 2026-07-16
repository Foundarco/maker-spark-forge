import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Notifications"
      group="Core"
      description="Your inbox for HQ alerts and activity updates."
    />
  ),
});
