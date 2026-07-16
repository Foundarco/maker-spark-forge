import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/kpis")({
  head: () => ({ meta: [{ title: "KPIs — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="KPIs"
      group="Analytics"
      description="Track KPIs across the business."
    />
  ),
});
