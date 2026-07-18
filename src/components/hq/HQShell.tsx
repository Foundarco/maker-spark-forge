import { Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

import { applyTheme, getStoredTheme } from "@/lib/hq/theme";

export function HQShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    applyTheme(getStoredTheme());
    return () => {
      // Restore light mode when leaving HQ
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-surface text-foreground">
      <aside className="hidden h-full w-64 flex-shrink-0 overflow-hidden lg:block">
        <Sidebar />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 flex lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full w-64" onClick={(e) => e.stopPropagation()}>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1 bg-black/40 backdrop-blur-sm" />
        </div>
      )}

      <div className="flex flex-1 min-w-0 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

