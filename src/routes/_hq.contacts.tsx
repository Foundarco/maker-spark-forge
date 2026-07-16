import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/contacts")({
  head: () => ({ meta: [{ title: "Contacts — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Contacts"
      group="Communication"
      description="Your address book of internal and external contacts."
    />
  ),
});
