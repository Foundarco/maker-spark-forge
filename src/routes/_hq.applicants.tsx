import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/applicants")({
  head: () => ({ meta: [{ title: "Applicants — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Applicants"
      group="Human Resources"
      description="Candidates and their pipeline stage."
    />
  ),
});
