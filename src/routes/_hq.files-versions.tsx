import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/files-versions")({
  head: () => ({ meta: [{ title: "Version History — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Version History"
      group="Files"
      description="Historical versions of any file."
    />
  ),
});
