import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/rd-experiments")({
  head: () => ({ meta: [{ title: "Experiments — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Experiments"
      group="R&D"
      description="Structured experiments and results."
    />
  ),
});
