import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/rd-test-data")({
  head: () => ({ meta: [{ title: "Test Data — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Test Data"
      group="R&D"
      description="Raw and processed test data."
    />
  ),
});
