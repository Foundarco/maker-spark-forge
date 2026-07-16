import { Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { AIAssistant } from "./AIAssistant";
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
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <Topbar onMenuClick={() => setMobileOpen(true)} />
      <div className="flex flex-1 min-h-0">
        <aside className="hidden h-full w-64 flex-shrink-0 overflow-hidden lg:block">
          <Sidebar />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-30 flex lg:hidden" onClick={() => setMobileOpen(false)}>
            <div className="w-64" onClick={(e) => e.stopPropagation()}>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="flex-1 bg-black/40 backdrop-blur-sm" />
          </div>
        )}

        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}
