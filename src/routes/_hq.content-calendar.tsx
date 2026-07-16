import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/content-calendar")({
  head: () => ({ meta: [{ title: "Content Calendar — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Content Calendar"
      group="Marketing"
      description="Editorial calendar across channels."
    />
  ),
});
