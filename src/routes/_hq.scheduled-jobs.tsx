import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/scheduled-jobs")({
  head: () => ({ meta: [{ title: "Scheduled Jobs — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Scheduled Jobs"
      group="Automation"
      description="Recurring jobs and their run history."
    />
  ),
});
