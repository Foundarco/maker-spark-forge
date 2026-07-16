import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/it-sso")({
  head: () => ({ meta: [{ title: "SSO — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="SSO"
      group="IT"
      description="Single sign-on configuration."
    />
  ),
});
