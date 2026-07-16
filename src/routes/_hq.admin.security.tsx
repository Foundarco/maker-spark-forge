import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/admin/security")({
  head: () => ({ meta: [{ title: "Security Policies — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Security Policies"
      group="Administration"
      description="Passwords, MFA, session policies."
    />
  ),
});
