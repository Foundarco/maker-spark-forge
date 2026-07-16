import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/admin/domains")({
  head: () => ({ meta: [{ title: "Domains — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Domains"
      group="Administration"
      description="Custom domains for HQ and public sites."
    />
  ),
});
