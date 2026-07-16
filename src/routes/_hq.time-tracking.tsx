import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/time-tracking")({
  head: () => ({ meta: [{ title: "Time Tracking — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Time Tracking"
      group="Human Resources"
      description="Hours worked and project time tracking."
    />
  ),
});
