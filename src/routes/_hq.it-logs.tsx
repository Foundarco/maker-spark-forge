import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/it-logs")({
  head: () => ({ meta: [{ title: "IT Logs — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="IT Logs"
      group="IT"
      description="Aggregated system logs."
    />
  ),
});
