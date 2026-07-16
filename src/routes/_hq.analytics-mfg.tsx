import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/analytics-mfg")({
  head: () => ({ meta: [{ title: "Manufacturing Metrics — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Manufacturing Metrics"
      group="Analytics"
      description="Yield, cycle time, and throughput."
    />
  ),
});
