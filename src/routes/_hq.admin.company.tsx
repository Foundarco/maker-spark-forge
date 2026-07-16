import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/admin/company")({
  head: () => ({ meta: [{ title: "Company — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Company"
      group="Administration"
      description="Company profile and details."
    />
  ),
});
