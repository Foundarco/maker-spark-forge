import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/crm")({
  head: () => ({ meta: [{ title: "CRM — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="CRM"
      group="Sales"
      description="Customer relationship management."
    />
  ),
});
