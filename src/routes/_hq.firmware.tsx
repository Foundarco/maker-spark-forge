import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/firmware")({
  head: () => ({ meta: [{ title: "Firmware — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Firmware"
      group="Engineering"
      description="Firmware builds, versions, and release notes."
    />
  ),
});
