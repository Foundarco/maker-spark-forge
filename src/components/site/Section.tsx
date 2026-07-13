import type { ReactNode } from "react";

export function Section({
  children,
  className = "",
  id,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  wide?: boolean;
}) {
  return (
    <section id={id} className={`mx-auto w-full ${wide ? "max-w-7xl" : "max-w-6xl"} px-5 py-16 sm:px-8 sm:py-24 ${className}`}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
      {children}
    </p>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
}) {
  return (
    <div className="mb-12 max-w-3xl sm:mb-16">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="text-5xl font-semibold leading-[0.98] tracking-tight text-ink sm:text-6xl md:text-7xl">
        {title}
      </h1>
      {lede ? (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {lede}
        </p>
      ) : null}
    </div>
  );
}
