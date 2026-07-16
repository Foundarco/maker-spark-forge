import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/channels")({
  head: () => ({ meta: [{ title: "Channels — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Channels"
      group="Communication"
      description="Topic-based chat rooms for teams and projects."
    />
  ),
});
