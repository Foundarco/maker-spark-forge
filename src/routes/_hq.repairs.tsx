import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/repairs")({
  head: () => ({ meta: [{ title: "Repair Tracking — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Repair Tracking"
      group="Customer Service"
      description="Track physical repairs from intake to return."
    />
  ),
});
