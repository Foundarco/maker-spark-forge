import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/brand-assets")({
  head: () => ({ meta: [{ title: "Brand Assets — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Brand Assets"
      group="Marketing"
      description="Logos, guidelines, and reusable assets."
    />
  ),
});
