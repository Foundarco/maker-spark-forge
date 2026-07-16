import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/forecasting")({
  head: () => ({ meta: [{ title: "Forecasting — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Forecasting"
      group="Finance"
      description="Revenue and cash flow forecasts."
      warning="Financial and tax logic. Review with your bookkeeper or accountant before relying on any values here for real financial records."
    />
  ),
});
