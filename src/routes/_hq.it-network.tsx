import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/it-network")({
  head: () => ({ meta: [{ title: "Networking — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Networking"
      group="IT"
      description="Network configuration and topology."
    />
  ),
});
