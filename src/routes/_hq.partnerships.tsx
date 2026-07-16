import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/partnerships")({
  head: () => ({ meta: [{ title: "Partnerships — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Partnerships"
      group="Business"
      description="Partner companies and joint initiatives."
    />
  ),
});
