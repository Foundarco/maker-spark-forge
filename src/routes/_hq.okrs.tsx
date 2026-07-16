import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/okrs")({
  head: () => ({ meta: [{ title: "OKRs — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="OKRs"
      group="Business"
      description="Objectives and key results by team."
    />
  ),
});
