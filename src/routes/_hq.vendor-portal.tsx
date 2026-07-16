import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/vendor-portal")({
  head: () => ({ meta: [{ title: "Vendor Portal — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Vendor Portal"
      group="Supply Chain"
      description="External-facing portal for vendors to manage POs and shipments."
    />
  ),
});
