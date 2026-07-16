import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/media-library")({
  head: () => ({ meta: [{ title: "Media Library — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Media Library"
      group="Marketing"
      description="Photos, videos, and marketing assets."
    />
  ),
});
