import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/files")({
  head: () => ({ meta: [{ title: "Cloud Storage — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Cloud Storage"
      group="Files"
      description="The company-wide file store."
    />
  ),
});
