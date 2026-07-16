import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/rd-simulations")({
  head: () => ({ meta: [{ title: "Simulations — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Simulations"
      group="R&D"
      description="CFD, FEA, and other simulation records."
    />
  ),
});
