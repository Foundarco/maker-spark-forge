import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/pipeline")({
  head: () => ({ meta: [{ title: "Sales Pipeline — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Sales Pipeline"
      group="Sales"
      description="Deal stages and forecasted revenue."
    />
  ),
});
