import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_hq/admin/permissions")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/company", search: { tab: "overrides" } as any });
  },
});
