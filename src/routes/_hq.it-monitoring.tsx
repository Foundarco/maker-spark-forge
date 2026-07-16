import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/it-monitoring")({
  head: () => ({ meta: [{ title: "Monitoring — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Monitoring"
      group="IT"
      description="Uptime, health, and alerts."
    />
  ),
});
