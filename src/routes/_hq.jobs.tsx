import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_hq/jobs")({
  component: () => <Outlet />,
});
