import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/contracts")({
  head: () => ({ meta: [{ title: "Contracts — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Contracts"
      group="Sales"
      description="Signed and pending sales contracts."
    />
  ),
});
