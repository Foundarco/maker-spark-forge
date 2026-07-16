import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/quotes")({
  head: () => ({ meta: [{ title: "Quotes — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Quotes"
      group="Sales"
      description="Sales quotes and proposal drafts."
    />
  ),
});
