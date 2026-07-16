import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/it-backups")({
  head: () => ({ meta: [{ title: "IT Backups — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="IT Backups"
      group="IT"
      description="System-level backup schedules and health."
    />
  ),
});
