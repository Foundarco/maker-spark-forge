import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/machines")({
  head: () => ({ meta: [{ title: "Machine Monitoring — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Machine Monitoring"
      group="Manufacturing"
      description="Live status of production machines."
    />
  ),
});
