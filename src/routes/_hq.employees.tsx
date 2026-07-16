import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/employees")({
  head: () => ({ meta: [{ title: "Employees — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Employees"
      group="Human Resources"
      description="Employee directory and records."
    />
  ),
});
