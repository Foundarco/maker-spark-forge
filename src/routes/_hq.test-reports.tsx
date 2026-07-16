import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/test-reports")({
  head: () => ({ meta: [{ title: "Test Reports — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Test Reports"
      group="Engineering"
      description="Structured test results across products and revisions."
    />
  ),
});
