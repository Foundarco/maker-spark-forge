import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/cms")({
  head: () => ({ meta: [{ title: "Website CMS — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Website CMS"
      group="Marketing"
      description="Manage the public marketing website content."
    />
  ),
});
