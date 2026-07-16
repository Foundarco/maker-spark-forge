import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/sales-contacts")({
  head: () => ({ meta: [{ title: "Sales Contacts — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Sales Contacts"
      group="Sales"
      description="Contacts associated with accounts."
    />
  ),
});
