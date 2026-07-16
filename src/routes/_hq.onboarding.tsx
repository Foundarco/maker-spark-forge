import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Onboarding"
      group="Human Resources"
      description="New hire onboarding checklists."
    />
  ),
});
