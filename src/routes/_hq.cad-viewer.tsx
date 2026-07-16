import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/cad-viewer")({
  head: () => ({ meta: [{ title: "CAD Viewer — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="CAD Viewer"
      group="Files"
      description="In-browser viewer for CAD files."
    />
  ),
});
