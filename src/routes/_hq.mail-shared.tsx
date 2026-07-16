import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/hq/ModulePlaceholder";

export const Route = createFileRoute("/_hq/mail-shared")({
  head: () => ({ meta: [{ title: "Shared Mailboxes — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ModulePlaceholder
      title="Shared Mailboxes"
      group="Email"
      description="Team inboxes like support@ and sales@."
    />
  ),
});
