import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_hq/admin/access")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/company", search: { tab: "access" } as any });
  },
});
