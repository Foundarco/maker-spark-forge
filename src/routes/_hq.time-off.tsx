import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/time-off")({
  head: () => ({ meta: [{ title: "Time Off — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Time Off"
      group="Human Resources"
      description="PTO, sick leave, and holiday requests."
    />
  ),
});
