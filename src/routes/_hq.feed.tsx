import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/feed")({
  head: () => ({ meta: [{ title: "Company Feed — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Company Feed"
      group="Communication"
      description="A social feed of company-wide activity and announcements."
    />
  ),
});
