import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/analytics-employee")({
  head: () => ({ meta: [{ title: "Employee Metrics — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Employee Metrics"
      group="Analytics"
      description="Headcount, tenure, and performance."
    />
  ),
});
