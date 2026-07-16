import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_hq/profile")({
  beforeLoad: () => {
    throw redirect({ to: "/settings" });
  },
  component: () => null,
});
