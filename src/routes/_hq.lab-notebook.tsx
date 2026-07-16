import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/lab-notebook")({
  head: () => ({ meta: [{ title: "Lab Notebook — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Lab Notebook"
      group="Engineering"
      description="Timestamped engineering notes and experiments."
    />
  ),
});
