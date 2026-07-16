import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/settings")({
  head: () => ({ meta: [{ title: "Settings — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Settings"
      group="Core"
      description="Personal preferences, notification settings, and integrations."
    />
  ),
});
