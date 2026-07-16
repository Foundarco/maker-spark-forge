import { useEffect, useState } from "react";

export type HQTheme = "dark" | "light" | "system";

const KEY = "hq-theme";

export function getStoredTheme(): HQTheme {
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem(KEY) as HQTheme | null;
  return v === "light" || v === "dark" || v === "system" ? v : "dark";
}

export function resolveTheme(t: HQTheme): "dark" | "light" {
  if (t === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return t === "light" ? "light" : "dark";
}

export function applyTheme(t: HQTheme) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(t);
  const root = document.documentElement;
  if (resolved === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function setStoredTheme(t: HQTheme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, t);
  applyTheme(t);
}

export function useHQTheme() {
  const [theme, setTheme] = useState<HQTheme>(() => getStoredTheme());
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  const update = (t: HQTheme) => {
    setStoredTheme(t);
    setTheme(t);
  };
  return { theme, setTheme: update };
}
