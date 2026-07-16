import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/api-builder")({
  head: () => ({ meta: [{ title: "API Builder — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="API Builder"
      group="Automation"
      description="Build internal APIs without code."
    />
  ),
});
