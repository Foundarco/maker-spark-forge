import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/email-campaigns")({
  head: () => ({ meta: [{ title: "Email Campaigns — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Email Campaigns"
      group="Marketing"
      description="Marketing email campaigns and lists."
    />
  ),
});
