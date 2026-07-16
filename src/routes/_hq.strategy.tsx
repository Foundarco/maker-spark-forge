import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/strategy")({
  head: () => ({ meta: [{ title: "Strategy — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Strategy"
      group="Business"
      description="Strategic docs and long-term planning."
    />
  ),
});
