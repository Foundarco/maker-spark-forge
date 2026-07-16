import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/live-chat")({
  head: () => ({ meta: [{ title: "Live Chat — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Live Chat"
      group="Customer Service"
      description="Real-time customer chat sessions."
    />
  ),
});
