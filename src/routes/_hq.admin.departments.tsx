import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/admin/departments")({
  head: () => ({ meta: [{ title: "Departments — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Departments"
      group="Administration"
      description="Manage company departments."
    />
  ),
});
