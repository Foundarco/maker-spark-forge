import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/investors")({
  head: () => ({ meta: [{ title: "Investors — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Investors"
      group="Business"
      description="Cap table, updates, and investor communications."
    />
  ),
});
