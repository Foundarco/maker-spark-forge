import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/webhooks")({
  head: () => ({ meta: [{ title: "Webhooks — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Webhooks"
      group="Automation"
      description="Outgoing webhooks and delivery logs."
    />
  ),
});
