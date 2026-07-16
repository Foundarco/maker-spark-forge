import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/taxes")({
  head: () => ({ meta: [{ title: "Taxes — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Taxes"
      group="Finance"
      description="Tax collection, filing, and history."
      warning="Financial and tax logic. Review with your bookkeeper or accountant before relying on any values here for real financial records."
    />
  ),
});
