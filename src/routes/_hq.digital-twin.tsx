import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/digital-twin")({
  head: () => ({ meta: [{ title: "Digital Twin — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Digital Twin"
      group="Future / Wow"
      description="A digital twin of every printer and machine."
    />
  ),
});
