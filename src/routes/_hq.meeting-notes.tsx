import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/meeting-notes")({
  head: () => ({ meta: [{ title: "Meeting Notes — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Meeting Notes"
      group="Business"
      description="Notes from every recurring meeting."
    />
  ),
});
