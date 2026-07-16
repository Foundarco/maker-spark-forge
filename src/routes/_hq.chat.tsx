import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/chat")({
  head: () => ({ meta: [{ title: "Team Chat — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Team Chat"
      group="Communication"
      description="Company-wide chat with channels, threads, and DMs."
    />
  ),
});
