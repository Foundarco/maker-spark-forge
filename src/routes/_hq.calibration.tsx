import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/calibration")({
  head: () => ({ meta: [{ title: "Calibration — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Calibration"
      group="Manufacturing"
      description="Machine and tool calibration tracking."
    />
  ),
});
