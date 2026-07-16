import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/ai-insights")({
  head: () => ({ meta: [{ title: "AI Insights — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="AI Insights"
      group="Analytics"
      description="AI-generated business insights across modules."
    />
  ),
});
