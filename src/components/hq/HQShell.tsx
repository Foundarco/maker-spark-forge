import { Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { RecordTabsProvider } from "@/lib/hq/record-tabs";

import { applyTheme, getStoredTheme } from "@/lib/hq/theme";

export function HQShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    applyTheme(getStoredTheme());
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return (
    <RecordTabsProvider>
      <div className="flex h-dvh w-full overflow-hidden bg-sidebar text-foreground">
        <aside className="hidden h-full w-[260px] flex-shrink-0 overflow-hidden lg:block">
          <Sidebar />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-30 flex lg:hidden" onClick={() => setMobileOpen(false)}>
            <div className="h-full w-[260px]" onClick={(e) => e.stopPropagation()}>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="flex-1 bg-black/40 backdrop-blur-sm" />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden py-2 pr-2">
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            <Topbar onMenuClick={() => setMobileOpen(true)} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-surface">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </RecordTabsProvider>
  );
}
