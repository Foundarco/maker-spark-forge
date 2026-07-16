import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/calls")({
  head: () => ({ meta: [{ title: "Voice Calls — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Voice Calls"
      group="Communication"
      description="Voice calling between team members."
    />
  ),
});
