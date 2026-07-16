import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/docs")({
  head: () => ({ meta: [{ title: "Documentation — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Documentation"
      group="Engineering"
      description="Engineering wiki, specs, and internal documentation."
    />
  ),
});
