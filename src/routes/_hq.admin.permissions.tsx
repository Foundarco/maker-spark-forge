import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/admin/permissions")({
  head: () => ({ meta: [{ title: "Permissions — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Permissions"
      group="Administration"
      description="Fine-grained permission overrides."
    />
  ),
});
