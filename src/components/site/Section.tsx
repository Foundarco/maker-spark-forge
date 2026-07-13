import type { ReactNode } from "react";

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24 ${className}`}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">
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
    <div className="mb-10 max-w-3xl sm:mb-14">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl md:text-6xl">
        {title}
      </h1>
      {lede ? (
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {lede}
        </p>
      ) : null}
    </div>
  );
}
