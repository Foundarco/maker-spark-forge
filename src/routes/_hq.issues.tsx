import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/issues")({
  head: () => ({ meta: [{ title: "Issue Tracker — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Issue Tracker"
      group="Engineering"
      description="Engineering bugs, hardware issues, and defects."
    />
  ),
});
