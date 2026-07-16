import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/rd-patents")({
  head: () => ({ meta: [{ title: "Patent Tracking — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Patent Tracking"
      group="R&D"
      description="Filed and pending patents."
    />
  ),
});
