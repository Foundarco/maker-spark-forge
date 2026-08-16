import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_hq/teams")({
  component: () => <Outlet />,
});
