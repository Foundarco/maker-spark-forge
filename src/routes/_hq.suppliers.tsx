import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Suppliers"
      group="Supply Chain"
      description="The list of active and archived suppliers."
    />
  ),
});
