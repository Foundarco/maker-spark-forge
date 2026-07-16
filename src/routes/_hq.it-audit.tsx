import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/it-audit")({
  head: () => ({ meta: [{ title: "Audit Logs — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Audit Logs"
      group="IT"
      description="Who did what, when — auditable event log."
    />
  ),
});
