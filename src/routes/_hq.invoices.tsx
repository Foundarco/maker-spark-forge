import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/invoices")({
  head: () => ({ meta: [{ title: "Invoices — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Invoices"
      group="Finance"
      description="Outgoing customer invoices and payment status."
      warning="Financial and tax logic. Review with your bookkeeper or accountant before relying on any values here for real financial records."
    />
  ),
});
