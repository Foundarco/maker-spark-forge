import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  return (
    <As
      className={`transparency-card group relative flex flex-col rounded-2xl p-6 shadow-[0_1px_0_0_rgba(0,0,0,0.02)] transition hover:border-primary/40 ${className}`}
    >
      {children}
    </As>
  );
}
