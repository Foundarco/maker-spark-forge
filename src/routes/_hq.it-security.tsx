import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/it-security")({
  head: () => ({ meta: [{ title: "Security — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Security"
      group="IT"
      description="Security policies, incidents, and posture."
    />
  ),
});
