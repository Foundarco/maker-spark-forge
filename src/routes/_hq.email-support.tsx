import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/email-support")({
  head: () => ({ meta: [{ title: "Email Support — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Email Support"
      group="Customer Service"
      description="Shared support inbox."
    />
  ),
});
