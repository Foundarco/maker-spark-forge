import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/warranty-claims")({
  head: () => ({ meta: [{ title: "Warranty Claims — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Warranty Claims"
      group="Customer Service"
      description="Customer warranty submissions and resolutions."
    />
  ),
});
