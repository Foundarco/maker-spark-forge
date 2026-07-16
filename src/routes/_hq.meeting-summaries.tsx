import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/meeting-summaries")({
  head: () => ({ meta: [{ title: "Meeting Summaries — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Meeting Summaries"
      group="Future / Wow"
      description="AI-generated meeting summaries with linked tasks."
    />
  ),
});
