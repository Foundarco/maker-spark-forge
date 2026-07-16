import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/policies")({
  head: () => ({ meta: [{ title: "Policies — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Policies"
      group="Business"
      description="Internal company policies."
    />
  ),
});
