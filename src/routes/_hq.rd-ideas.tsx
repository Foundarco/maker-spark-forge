import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/rd-ideas")({
  head: () => ({ meta: [{ title: "R&D Ideas — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="R&D Ideas"
      group="R&D"
      description="Ideation and idea evaluation."
    />
  ),
});
