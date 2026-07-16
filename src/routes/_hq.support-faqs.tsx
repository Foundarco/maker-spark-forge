import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/support-faqs")({
  head: () => ({ meta: [{ title: "Support FAQs — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Support FAQs"
      group="Customer Service"
      description="Frequently asked questions from customers."
    />
  ),
});
