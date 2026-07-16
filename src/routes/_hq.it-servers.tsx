import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/it-servers")({
  head: () => ({ meta: [{ title: "Servers — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Servers"
      group="IT"
      description="Server infrastructure and status."
    />
  ),
});
