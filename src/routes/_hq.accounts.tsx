import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/accounts")({
  head: () => ({ meta: [{ title: "Customer Accounts — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Customer Accounts"
      group="Sales"
      description="Enterprise account records."
    />
  ),
});
