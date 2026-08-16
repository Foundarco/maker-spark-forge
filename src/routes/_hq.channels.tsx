import { createFileRoute, redirect } from "@tanstack/react-router";

/** Internal team chat moved to Slack — this route only exists to keep old links alive. */
export const Route = createFileRoute("/_hq/channels")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});
