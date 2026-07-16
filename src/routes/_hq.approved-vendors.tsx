import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/approved-vendors")({
  head: () => ({ meta: [{ title: "Approved Vendors — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Approved Vendors"
      group="Supply Chain"
      description="The approved vendor list and requalification schedule."
    />
  ),
});
