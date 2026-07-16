import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/benefits")({
  head: () => ({ meta: [{ title: "Benefits — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Benefits"
      group="Human Resources"
      description="Employee benefits enrollment and info."
    />
  ),
});
