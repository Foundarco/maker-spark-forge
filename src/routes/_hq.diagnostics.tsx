import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/diagnostics")({
  head: () => ({ meta: [{ title: "Remote Diagnostics — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Remote Diagnostics"
      group="Customer Service"
      description="Live device diagnostics with customer permission."
    />
  ),
});
