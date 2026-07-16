import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/phone-logs")({
  head: () => ({ meta: [{ title: "Phone Logs — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Phone Logs"
      group="Customer Service"
      description="Call history and notes."
    />
  ),
});
