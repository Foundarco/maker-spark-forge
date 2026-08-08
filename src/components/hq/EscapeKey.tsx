import { useEffect } from "react";

/**
 * Headless helper: render inside a modal overlay so pressing Escape closes it.
 * Keeps keyboard users from being stranded in hand-rolled dialogs.
 */
export function EscapeKey({ onEscape }: { onEscape: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onEscape]);
  return null;
}
