import { Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PanelLeftOpen } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommsRail } from "./CommsRail";
import { RecordTabsProvider, useRecordTabs } from "@/lib/hq/record-tabs";
import { navGroups } from "./nav-config";
import { applyTheme, getStoredTheme } from "@/lib/hq/theme";
import { PhoneProvider } from "@/lib/hq/phone";
import { SoundNotifier } from "./SoundNotifier";
import { ProductTour } from "./ProductTour";
import { CurrentAppProvider } from "@/lib/hq/app-context";
import { AppGate } from "./AppGate";

const HIDE_KEY = "hq.sidebar.hidden";

function TabAutoOpener() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { openTab } = useRecordTabs();
  useEffect(() => {
    if (!pathname || pathname === "/" || pathname === "/dashboard") return;
    for (const g of navGroups) {
      for (const item of g.items) {
        if (item.to === pathname) {
          openTab({ id: item.to, label: item.label, to: item.to });
          return;
        }
      }
    }
  }, [pathname, openTab]);
  return null;
}


export function HQShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(HIDE_KEY) === "1";
  });

  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  const setHiddenPersist = (v: boolean) => {
    setHidden(v);
    try { localStorage.setItem(HIDE_KEY, v ? "1" : "0"); } catch {}
  };

  return (
    <CurrentAppProvider>
    <AppGate>
    <PhoneProvider>
    <RecordTabsProvider>
      <TabAutoOpener />
      <SoundNotifier />
      <ProductTour />
      <div className="flex h-dvh w-full overflow-hidden bg-surface text-foreground">
        <aside
          className="hidden h-full flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-out lg:block"
          style={{ width: hidden ? 0 : "var(--sidebar-w, 260px)" }}
        >
          <Sidebar onCollapse={() => setHiddenPersist(true)} />
        </aside>


        {mobileOpen && (
          <div className="fixed inset-0 z-30 flex lg:hidden" onClick={() => setMobileOpen(false)}>
            <div role="dialog" aria-modal="true" className="h-full w-[260px]" onClick={(e) => e.stopPropagation()}>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="flex-1 bg-black/40 backdrop-blur-sm" />
          </div>
        )}

        {hidden && (
          <button
            onClick={() => setHiddenPersist(false)}
            className="fixed left-3 top-3 z-40 hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition hover:bg-muted lg:flex"
            aria-label="Open sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden py-2 pr-2 pl-2">
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            <Topbar onMenuClick={() => setMobileOpen(true)} />
            <div className="flex min-h-0 flex-1">
              <CommsRail />
              <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-background">
                <Outlet />
              </main>
            </div>

          </div>
        </div>
      </div>
    </RecordTabsProvider>
    </PhoneProvider>
    </AppGate>
    </CurrentAppProvider>
  );
}
