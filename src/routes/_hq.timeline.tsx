import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/timeline")({
  head: () => ({ meta: [{ title: "Unified Timeline — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Unified Timeline"
      group="Future / Wow"
      description="Everything happening across the company in one timeline."
    />
  ),
});
