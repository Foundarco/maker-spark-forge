import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Roadmap"
      group="Business"
      description="The forward roadmap for products and initiatives."
    />
  ),
});
