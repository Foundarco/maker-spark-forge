import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/it-devices")({
  head: () => ({ meta: [{ title: "Devices — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Devices"
      group="IT"
      description="Company-owned laptops and devices."
    />
  ),
});
