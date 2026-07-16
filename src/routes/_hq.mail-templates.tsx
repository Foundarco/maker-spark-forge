import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/mail-templates")({
  head: () => ({ meta: [{ title: "Templates — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Templates"
      group="Email"
      description="Reusable email templates."
    />
  ),
});
