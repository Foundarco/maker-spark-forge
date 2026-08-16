import { createFileRoute, redirect } from "@tanstack/react-router";

/** Internal direct messages moved to Slack — kept as a redirect for old links. */
export const Route = createFileRoute("/_hq/dm")({
  validateSearch: (search: Record<string, unknown>) => ({
    user: typeof search.user === "string" ? search.user : undefined,
  }),
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});
