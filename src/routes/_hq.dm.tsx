import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/dm")({
  head: () => ({ meta: [{ title: "Direct Messages — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Direct Messages"
      group="Communication"
      description="Private one-on-one and group conversations."
    />
  ),
});
