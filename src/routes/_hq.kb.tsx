import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/kb")({
  head: () => ({ meta: [{ title: "Knowledge Base — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Knowledge Base"
      group="Customer Service"
      description="Internal and customer-facing help articles."
    />
  ),
});
