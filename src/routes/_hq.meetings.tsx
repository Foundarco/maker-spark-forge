import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/meetings")({
  head: () => ({ meta: [{ title: "Video Meetings — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Video Meetings"
      group="Communication"
      description="Scheduled and ad-hoc video meetings with recording."
    />
  ),
});
