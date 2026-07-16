import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/pnl")({
  head: () => ({ meta: [{ title: "Profit & Loss — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Profit & Loss"
      group="Finance"
      description="Profit and loss statement."
      warning="Financial and tax logic. Review with your bookkeeper or accountant before relying on any values here for real financial records."
    />
  ),
});
