import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/repos")({
  head: () => ({ meta: [{ title: "Repositories — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Repositories"
      group="Engineering"
      description="Linked source code repositories and commit history."
    />
  ),
});
