import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/press-releases")({
  head: () => ({ meta: [{ title: "Press Releases — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Press Releases"
      group="Marketing"
      description="Press release drafts and archive."
    />
  ),
});
