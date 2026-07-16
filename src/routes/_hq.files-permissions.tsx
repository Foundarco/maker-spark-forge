import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/files-permissions")({
  head: () => ({ meta: [{ title: "File Permissions — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="File Permissions"
      group="Files"
      description="Manage sharing and access control."
    />
  ),
});
