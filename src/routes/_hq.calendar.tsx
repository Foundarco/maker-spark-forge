import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Calendar"
      group="Communication"
      description="Shared and personal calendars."
    />
  ),
});
