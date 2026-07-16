import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/org-chart")({
  head: () => ({ meta: [{ title: "Org Chart — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Org Chart"
      group="Human Resources"
      description="Company organizational chart."
    />
  ),
});
