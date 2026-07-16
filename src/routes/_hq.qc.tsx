import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/qc")({
  head: () => ({ meta: [{ title: "Quality Control — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Quality Control"
      group="Manufacturing"
      description="QC checklists, defects, and pass/fail records."
    />
  ),
});
