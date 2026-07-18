import { Link, useRouterState } from "@tanstack/react-router";
import { X, LayoutDashboard, Plus } from "lucide-react";
import { useRecordTabs } from "@/lib/hq/record-tabs";

export function RecordTabs() {
  const { tabs, closeTab } = useRecordTabs();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex items-end gap-1 overflow-x-auto px-3 pt-2">
      {tabs.map((tab) => {
        const active = pathname === tab.to || (tab.id === "dashboard" && pathname === "/");
        return (
          <div
            key={tab.id}
            className={`group relative flex h-9 items-center gap-2 rounded-t-lg border border-b-0 pl-3 pr-2 text-[13px] transition ${
              active
                ? "border-border bg-card text-foreground shadow-[0_-1px_0_0_var(--color-primary)]"
                : "border-transparent bg-transparent text-muted-foreground hover:bg-card/60 hover:text-foreground"
            }`}
          >
            <Link to={tab.to} className="flex items-center gap-2">
              {tab.id === "dashboard" && <LayoutDashboard className="h-3.5 w-3.5" />}
              <span className="max-w-[160px] truncate">{tab.label}</span>
            </Link>
            {!tab.pinned && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); closeTab(tab.id); }}
                className="rounded p-0.5 opacity-0 transition hover:bg-muted group-hover:opacity-100"
                aria-label="Close tab"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}
      <button
        className="ml-1 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-card hover:text-foreground"
        aria-label="New tab"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
