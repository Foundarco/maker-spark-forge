import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/lead-times")({
  head: () => ({ meta: [{ title: "Lead Times — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Lead Times"
      group="Supply Chain"
      description="Vendor lead times by part and history."
    />
  ),
});
