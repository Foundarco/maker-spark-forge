import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/rma")({
  head: () => ({ meta: [{ title: "Returns (RMA) — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Returns (RMA)"
      group="Customer Service"
      description="Return merchandise authorizations."
    />
  ),
});
