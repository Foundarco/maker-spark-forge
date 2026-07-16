import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/mail-drafts")({
  head: () => ({ meta: [{ title: "Drafts — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Drafts"
      group="Email"
      description="Email drafts."
    />
  ),
});
