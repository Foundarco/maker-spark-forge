import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/it-api-keys")({
  head: () => ({ meta: [{ title: "API Keys — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="API Keys"
      group="IT"
      description="Internal API keys and secrets rotation."
    />
  ),
});
