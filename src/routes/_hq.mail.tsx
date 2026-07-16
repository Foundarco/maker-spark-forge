import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/mail")({
  head: () => ({ meta: [{ title: "Inbox — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Inbox"
      group="Email"
      description="Your work email inbox."
    />
  ),
});
