import type { OrgApp } from "./apps";

/**
 * Each team app is visually its own product: own accent, own sidebar
 * treatment, own layout personality. This paints the current app's identity
 * onto the document so every HQ surface inherits it.
 */
export function applyAppTheme(app: OrgApp | null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  root.setAttribute("data-app", app?.slug ?? "hq");
  root.setAttribute("data-app-layout", app?.layout || "classic");

  const light = app?.accent;
  const dark = app?.accent_dark || app?.accent;
  if (!light) {
    for (const v of ["--app-accent", "--app-accent-dark"]) root.style.removeProperty(v);
    return;
  }
  root.style.setProperty("--app-accent", light);
  root.style.setProperty("--app-accent-dark", dark || light);
}
