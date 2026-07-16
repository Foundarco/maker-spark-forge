import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/marketing-blog")({
  head: () => ({ meta: [{ title: "Blog — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Blog"
      group="Marketing"
      description="Draft, review, and publish blog posts."
    />
  ),
});
