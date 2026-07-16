import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/files-backup")({
  head: () => ({ meta: [{ title: "Backups — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Backups"
      group="Files"
      description="File backup status and restore."
    />
  ),
});
