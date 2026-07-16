import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/decision-log")({
  head: () => ({ meta: [{ title: "Decision Log — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Decision Log"
      group="Business"
      description="A durable record of significant company decisions."
    />
  ),
});
