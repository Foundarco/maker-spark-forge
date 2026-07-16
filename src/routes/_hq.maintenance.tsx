import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Maintenance"
      group="Manufacturing"
      description="Preventive and reactive maintenance schedules."
    />
  ),
});
