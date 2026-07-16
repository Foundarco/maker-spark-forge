import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/budgets")({
  head: () => ({ meta: [{ title: "Budgets — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Budgets"
      group="Finance"
      description="Department budgets and variance tracking."
      warning="Financial and tax logic. Review with your bookkeeper or accountant before relying on any values here for real financial records."
    />
  ),
});
