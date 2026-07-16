import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/interviews")({
  head: () => ({ meta: [{ title: "Interviews — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Interviews"
      group="Human Resources"
      description="Scheduled interviews and feedback."
    />
  ),
});
