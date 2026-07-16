import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="AI Assistant"
      group="Core"
      description="Full-page chat with your HQ AI copilot. Use the floating button on any page for quick questions."
    />
  ),
});
