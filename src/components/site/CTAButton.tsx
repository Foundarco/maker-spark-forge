import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "light";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:brightness-110 hover:-translate-y-0.5 shadow-lg shadow-primary/20",
  secondary: "border border-border bg-card text-foreground hover:border-foreground/40",
  ghost: "text-foreground hover:bg-muted",
  light: "bg-white text-ink hover:bg-white/90",
};

export function CTAButton({
  children,
  variant = "primary",
  className = "",
  ...rest
}: { children: ReactNode; variant?: Variant; className?: string } & ComponentProps<typeof Link>) {
  return (
    <Link {...rest} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function CTAButtonA({
  children,
  variant = "primary",
  className = "",
  ...rest
}: { children: ReactNode; variant?: Variant; className?: string } & ComponentProps<"a">) {
  return (
    <a {...rest} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </a>
  );
}

export function CTAButtonBtn({
  children,
  variant = "primary",
  className = "",
  ...rest
}: { children: ReactNode; variant?: Variant; className?: string } & ComponentProps<"button">) {
  return (
    <button {...rest} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
