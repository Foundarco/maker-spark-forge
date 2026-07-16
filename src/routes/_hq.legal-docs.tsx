import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/legal-docs")({
  head: () => ({ meta: [{ title: "Legal Documents — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Legal Documents"
      group="Business"
      description="Contracts, NDAs, and legal records."
    />
  ),
});
