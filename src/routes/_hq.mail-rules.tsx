import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/mail-rules")({
  head: () => ({ meta: [{ title: "Rules — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Rules"
      group="Email"
      description="Email routing and auto-response rules."
    />
  ),
});
