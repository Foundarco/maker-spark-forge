import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/approvals")({
  head: () => ({ meta: [{ title: "Approval Chains — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Approval Chains"
      group="Automation"
      description="Configurable multi-step approvals."
    />
  ),
});
