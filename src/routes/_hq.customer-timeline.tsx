import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/customer-timeline")({
  head: () => ({ meta: [{ title: "Customer Timeline — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Customer Timeline"
      group="Customer Service"
      description="Every interaction with a customer in one view."
    />
  ),
});
