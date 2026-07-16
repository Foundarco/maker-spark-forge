import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/goals")({
  head: () => ({ meta: [{ title: "Company Goals — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Company Goals"
      group="Business"
      description="Top-level company goals for the year."
    />
  ),
});
