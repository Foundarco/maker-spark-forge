import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/projects")({
  head: () => ({ meta: [{ title: "Projects — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Projects"
      group="Engineering"
      description="Engineering projects, from concept to release."
    />
  ),
});
