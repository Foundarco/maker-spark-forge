import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/serials")({
  head: () => ({ meta: [{ title: "Serial Numbers — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Serial Numbers"
      group="Manufacturing"
      description="Serial number allocation and traceability."
    />
  ),
});
