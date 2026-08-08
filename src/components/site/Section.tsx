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
    <section
      id={id}
      className={`mx-auto w-full ${wide ? "max-w-7xl" : "max-w-6xl"} px-5 py-20 sm:px-8 sm:py-28 ${className}`}
    >
      {children}
    </section>
  );
}

/** Numbered architectural section marker: "— 02 / THE McGUIRE GROUP" */
export function SectionLabel({
  n,
  children,
  tone = "dark",
  className = "",
  as: Tag = "p",
}: {
  n?: string;
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
  as?: "p" | "h2" | "h3";
}) {
  const color = tone === "light" ? "text-white/55" : "text-muted-foreground";
  const rule = tone === "light" ? "bg-white/30" : "bg-ink/30";
  return (
    <Tag className={`rule-label flex items-center gap-3 ${color} ${className}`}>
      <span className={`h-px w-10 ${rule}`} aria-hidden />
      {n ? <span className="tabular-nums">{n}</span> : null}
      {n ? <span aria-hidden className={color}>/</span> : null}
      <span>{children}</span>
    </Tag>
  );
}

export function DisplayHeadingPlaceholder() {
  return null;
}

export function Eyebrow({ children, as: Tag = "p" }: { children: ReactNode; as?: "p" | "h2" | "h3" }) {
  return (
    <Tag className="rule-label mb-4 flex items-center gap-3 text-muted-foreground">
      <span className="h-px w-8 bg-ink/30" aria-hidden />
      {children}
    </Tag>
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
    <div className="max-w-3xl">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="text-4xl font-bold leading-[1.02] tracking-tight text-ink sm:text-6xl">{title}</h1>
      {lede ? (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{lede}</p>
      ) : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${className}`}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">{title}</h2>
      {lede ? <p className="mt-4 text-base leading-relaxed text-muted-foreground">{lede}</p> : null}
    </div>
  );
}
