import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { HardHat, LayoutDashboard, FileSpreadsheet, FolderOpen, MessagesSquare, LogOut } from "lucide-react";

export type PortalContext = { clientId: string; clientName: string; portalUserId: string };

const NAV = [
  { to: "/portal", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/portal/jobs", label: "My Projects", icon: HardHat },
  { to: "/portal/invoices", label: "Invoices", icon: FileSpreadsheet },
  { to: "/portal/documents", label: "Documents", icon: FolderOpen },
  { to: "/portal/messages", label: "Messages", icon: MessagesSquare },
] as const;

export const Route = createFileRoute("/portal")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/client-login" });
    const { data: membership } = await supabase
      .from("con_client_portal_users")
      .select("id, client_id, con_clients(name, company)")
      .eq("user_id", data.user.id)
      .eq("status", "active")
      .maybeSingle();
    if (!membership) throw redirect({ to: "/client-login" });
    const c = (membership as any).con_clients;
    return {
      portal: {
        clientId: (membership as any).client_id as string,
        clientName: (c?.company || c?.name || "Your account") as string,
        portalUserId: (membership as any).id as string,
      } satisfies PortalContext,
    };
  },
  component: PortalLayout,
});

function PortalLayout() {
  const { portal } = Route.useRouteContext();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/client-login", replace: true });
  };

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HardHat className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">{portal.clientName}</p>
              <p className="text-[11px] text-muted-foreground">McGuire Construction · Client Portal</p>
            </div>
          </div>
          <button onClick={signOut} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: (n as any).exact ?? false }}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-muted" }}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium"
            >
              <n.icon className="h-3.5 w-3.5" /> {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-6">
        <Outlet />
      </main>
    </div>
  );
}
