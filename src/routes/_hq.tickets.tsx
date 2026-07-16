import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/tickets")({
  head: () => ({ meta: [{ title: "Support Tickets — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Support Tickets"
      group="Customer Service"
      description="Customer support ticket queue."
    />
  ),
});
