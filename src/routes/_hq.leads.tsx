import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/leads")({
  head: () => ({ meta: [{ title: "Leads — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Leads"
      group="Sales"
      description="Inbound and outbound sales leads."
    />
  ),
});
