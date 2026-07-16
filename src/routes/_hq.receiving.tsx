import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/receiving")({
  head: () => ({ meta: [{ title: "Receiving — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Receiving"
      group="Manufacturing"
      description="Inbound shipments and receiving verification."
    />
  ),
});
