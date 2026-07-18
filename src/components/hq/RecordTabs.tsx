import { Link, useRouterState } from "@tanstack/react-router";
import { X, LayoutDashboard } from "lucide-react";
import { useRecordTabs } from "@/lib/hq/record-tabs";

export function RecordTabs() {
  const { tabs, closeTab } = useRecordTabs();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex items-center gap-0 overflow-x-auto px-3 pt-2 pb-0">
      {tabs.map((tab, idx) => {
        const active = pathname === tab.to || (tab.id === "dashboard" && pathname === "/");
        const prev = tabs[idx - 1];
        const prevActive =
          prev && (pathname === prev.to || (prev.id === "dashboard" && pathname === "/"));
        const showSeparator = idx > 0 && !active && !prevActive;
        return (
          <div key={tab.id} className="flex items-center">
            {showSeparator ? (
              <span aria-hidden className="mx-0.5 h-4 w-px bg-border/70" />
            ) : (
              <span aria-hidden className="mx-0.5 h-4 w-px bg-transparent" />
            )}
            <div
              className={`group relative flex h-9 items-center gap-2 rounded-t-lg border border-b-0 pl-3 pr-1.5 text-[13px] transition ${
                active
                  ? "border-border bg-card text-foreground shadow-[0_-2px_0_0_var(--color-primary)_inset]"
                  : "border-transparent bg-transparent text-muted-foreground hover:bg-card/60 hover:text-foreground"
              }`}
            >
              <Link to={tab.to} className="flex items-center gap-2">
                {tab.id === "dashboard" && <LayoutDashboard className="h-3.5 w-3.5" />}
                <span className="max-w-[180px] truncate">{tab.label}</span>
              </Link>
              {!tab.pinned && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="ml-1 flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground/70 transition hover:bg-muted hover:text-foreground"
                  aria-label={`Close ${tab.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
