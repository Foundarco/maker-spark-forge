import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/rd-papers")({
  head: () => ({ meta: [{ title: "Research Papers — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Research Papers"
      group="R&D"
      description="Curated papers relevant to our work."
    />
  ),
});
