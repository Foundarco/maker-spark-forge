import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_hq/quotes")({
  component: () => <Outlet />,
});
