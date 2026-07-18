import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

export type RecordTab = {
  id: string;
  label: string;
  to: string;
  icon?: string; // lucide icon name, optional
  pinned?: boolean;
};

const KEY = "hq.recordTabs.v1";

const DEFAULT_TABS: RecordTab[] = [
  { id: "dashboard", label: "Dashboard", to: "/dashboard", pinned: true },
];

type Ctx = {
  tabs: RecordTab[];
  openTab: (tab: RecordTab) => void;
  closeTab: (id: string) => void;
  clear: () => void;
};

const RecordTabsCtx = createContext<Ctx | null>(null);

export function RecordTabsProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<RecordTab[]>(DEFAULT_TABS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RecordTab[];
        if (Array.isArray(parsed) && parsed.length > 0) setTabs(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(tabs)); } catch {}
  }, [tabs]);

  const openTab = useCallback((tab: RecordTab) => {
    setTabs((prev) => {
      if (prev.some((t) => t.id === tab.id)) return prev;
      return [...prev, tab];
    });
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => prev.filter((t) => t.id === id ? t.pinned === true : true));
  }, []);

  const clear = useCallback(() => setTabs(DEFAULT_TABS), []);

  return (
    <RecordTabsCtx.Provider value={{ tabs, openTab, closeTab, clear }}>
      {children}
    </RecordTabsCtx.Provider>
  );
}

export function useRecordTabs() {
  const ctx = useContext(RecordTabsCtx);
  if (!ctx) throw new Error("useRecordTabs must be used within RecordTabsProvider");
  return ctx;
}
