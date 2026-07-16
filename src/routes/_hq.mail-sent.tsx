import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/mail-sent")({
  head: () => ({ meta: [{ title: "Sent — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Sent"
      group="Email"
      description="Sent email history."
    />
  ),
});
