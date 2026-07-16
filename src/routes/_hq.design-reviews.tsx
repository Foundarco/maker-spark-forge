import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/design-reviews")({
  head: () => ({ meta: [{ title: "Design Reviews — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Design Reviews"
      group="Engineering"
      description="Scheduled design reviews with comments and sign-off."
    />
  ),
});
