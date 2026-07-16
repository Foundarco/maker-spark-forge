import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/eco")({
  head: () => ({ meta: [{ title: "Engineering Change Orders — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Engineering Change Orders"
      group="Engineering"
      description="Formal change requests with approval workflow."
    />
  ),
});
