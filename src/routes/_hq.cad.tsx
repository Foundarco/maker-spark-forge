import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/cad")({
  head: () => ({ meta: [{ title: "CAD Library — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="CAD Library"
      group="Engineering"
      description="Central library of CAD files, revisions, and metadata."
    />
  ),
});
