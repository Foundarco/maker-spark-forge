import type { ReactNode } from "react";

/** Wraps copy that needs to be replaced with real content. */
export function Placeholder({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <span
      className="rounded-md border border-dashed border-primary/40 bg-primary-soft/40 px-1.5 py-0.5 text-primary/90"
      title={note ?? "Placeholder — replace with real content"}
    >
      {children}
    </span>
  );
}
