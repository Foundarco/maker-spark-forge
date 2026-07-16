import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/files-shared")({
  head: () => ({ meta: [{ title: "Shared Files — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Shared Files"
      group="Files"
      description="Files shared with you or your team."
    />
  ),
});
