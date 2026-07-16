import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/it-integrations")({
  head: () => ({ meta: [{ title: "Integrations — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Integrations"
      group="IT"
      description="Third-party integrations and their status."
    />
  ),
});
