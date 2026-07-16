import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/admin/branding")({
  head: () => ({ meta: [{ title: "Branding — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Branding"
      group="Administration"
      description="Company branding for HQ and public surfaces."
    />
  ),
});
