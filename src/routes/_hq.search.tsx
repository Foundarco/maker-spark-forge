import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/search")({
  head: () => ({ meta: [{ title: "Universal Search — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Universal Search"
      group="Core"
      description="Search across every module — customers, parts, orders, files, people, tickets."
    />
  ),
});
