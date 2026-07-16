import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/workflows")({
  head: () => ({ meta: [{ title: "Workflows — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Workflows"
      group="Automation"
      description="Automate cross-module workflows."
    />
  ),
});
